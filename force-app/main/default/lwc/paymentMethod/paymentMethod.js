import { LightningElement, api, track, wire } from 'lwc';
import * as Constants from './constants';
import getPaymentInfo from '@salesforce/apex/B2BPaymentController.getPaymentInfo';
import setPayment from '@salesforce/apex/B2BPaymentController.setPayment';
import authorizePaymentInfo from '@salesforce/apex/B2BPaymentController.authorizePaymentInfo';

//*************Checkout Special Handling Start.**********************/

import { NavigationMixin } from "lightning/navigation";
import { CheckoutInformationAdapter, simplePurchaseOrderPayment, CheckoutComponentBase } from "commerce/checkoutApi";
import { refreshCartSummary } from "commerce/cartApi";

const CheckoutStage = {
    CHECK_VALIDITY_UPDATE: 'CHECK_VALIDITY_UPDATE',
    REPORT_VALIDITY_SAVE: 'REPORT_VALIDITY_SAVE',
    BEFORE_PAYMENT: 'BEFORE_PAYMENT',
    PAYMENT: 'PAYMENT',
    BEFORE_PLACE_ORDER: 'BEFORE_PLACE_ORDER',
    PLACE_ORDER: 'PLACE_ORDER'
};

/**
 * Allows users to choose the type of payment (eg. Purchase Order, Credit Card)
 * and to fill out the required information for the chosen type.
 *
 */
export default class PaymentMethod extends NavigationMixin(CheckoutComponentBase) {

    isLoading = false;
    firstLoad = false;

    @track checkoutId;
    @track shippingAddress;
    @track showError = false;
    @track error;


    /**
     * 
     * Get the CheckoutData from the standard salesforce adapter
     * Response is expected to be 202 while checkout is starting
     * Response will be 200 when checkout start is complete and we can being processing checkout data 
     * 
     */
    @wire(CheckoutInformationAdapter, {})
    checkoutInfo({ error, data }) {
        this.isPreview = this.isInSitePreview();
            if (!this.isPreview) {
                this.isLoading = true;

                if (data) {
                    this.checkoutId = data.checkoutId;
                    this.shippingAddress = data.deliveryGroups.items[0].deliveryAddress;
                    if (data.checkoutStatus == 200) {
                        this.isLoading = false;
                    }
                } else if (error) {
                    console.log("##Payment Method checkoutInfo Error: " + error);
                }
            } else {
                this.isLoading = false;
            }
    }

    /**
     * update form when our container asks us to
     */
    stageAction(checkoutStage /*CheckoutStage*/) {
        switch (checkoutStage) {
            case CheckoutStage.CHECK_VALIDITY_UPDATE:
                return Promise.resolve(this.checkValidity());
            case CheckoutStage.REPORT_VALIDITY_SAVE:
                return Promise.resolve(this.reportValidity());
            case CheckoutStage.PAYMENT:
                return Promise.resolve(this.paymentProcess());
            default:
                return Promise.resolve(true);
        }
    }

    /**
     * Return true when terms checkoutbox is checked
     */
    checkValidity() {
        return true;
    }

    /**
     * report validity
     *
     * @returns boolean
     */
    @api
    reportValidity() {
        let isValid = false;
        const selectedAddressResult = this.getBillingAddress();

        if (
            this.selectedPaymentType !== Constants.PaymentTypeEnum.CARDPAYMENT
        ) {
            if (selectedAddressResult.error) {
                console.log('Payment Method BillingAddress not found: '+JSON.stringify(selectedAddressResult));
                this.showError = true;
                this.error = "Please Enter a Billing Address.";
            }
            const poInput = this.getComponent('[data-po-number]');
            // Make sure that PO input is valid first
            if (poInput != null) {
                console.log('Payment Method purchaseOrderInput: '+JSON.stringify(poInput));
                isValid = true;
                this.showError = false;
            }
        } else {
            if (selectedAddressResult.error) {
                this._creditCardErrorMessage = selectedAddressResult.error;
                console.log('Payment Method BillingAddress not found: '+JSON.stringify(selectedAddressResult));
                this.showError = true;
                this.error = "Please Enter a Billing Address.";
            }

            // First let's get the cc data
            const creditPaymentComponent = this.getComponent(
                '[data-credit-payment-method]'
            );

            // Second let's make sure the required fields are valid
            if (
                creditPaymentComponent != null
            ) {
                console.log('Payment Method CreditCard: '+JSON.stringify(creditPaymentComponent));
                isValid = true;
                this.showError = false;
            }
        }
        return isValid;
    }

    /**
    * checkout save
    */
    @api
    async paymentProcess() {
        if (!this.reportValidity()) {
            throw new Error('Required data is missing');
        }
        await this.completePayment();
        let orderConfirmation;
        if (this.isPoNumberSelected) {
            orderConfirmation = await this.dispatchPlaceOrderAsync();

            if (orderConfirmation.orderReferenceNumber) {
                refreshCartSummary();
                this.navigateToOrder(orderConfirmation.orderReferenceNumber);
            } else {
                throw new Error("Required orderReferenceNumber is missing");
            }
        }
        if (this.isCardPaymentSelected) {
            orderConfirmation = await this.AuthorizeToken();
            if (orderConfirmation) {
                refreshCartSummary();
                this.navigateToOrder(orderConfirmation);
            } else {
                throw new Error("Required orderReferenceNumber is missing");
            }
        }
    }

    @api
    async AuthorizeToken(){
        return await authorizePaymentInfo({
            cartId: this.cartId,
            selectedBillingAddress: this.getBillingAddress()
        }).catch((error) => {
            this._creditCardErrorMessage = error.body.message;
        });
    }
    /**
     * complete payment
     */
    @api
    async completePayment(){
        let address = this.shippingAddress;
        const selectedAddressResult = this.shippingAddress;
        const purchaseOrderInputValue = this.purchaseOrderNumber;
        let output;
        if(this.isPoNumberSelected){
            output = await simplePurchaseOrderPayment(this.checkoutId, purchaseOrderInputValue, address);
        }

        if(this.isCardPaymentSelected){

            const creditPaymentComponent = this.getComponent(
                '[data-credit-payment-method]'
            );
            
            const creditCardData = this.getCreditCardFromComponent(
                creditPaymentComponent
            );
            console.log('200 creditCardData'+JSON.stringify(creditCardData))
            creditCardData.cardNumber = creditCardData.cardNumber.replace(/\s/g, '');
            var splitExpiryDate = creditCardData.expiryMonth.split(' / ');
            creditCardData.expiryMonth = splitExpiryDate[0]; // First two digits (month)
            creditCardData.expiryYear = splitExpiryDate[1];  // Last four digits (year)

            console.log('202 Blank value removed'+JSON.stringify(creditCardData))

            await setPayment({
                paymentType: this.selectedPaymentType,
                cartId: this.cartId,
                billingAddress: selectedAddressResult,
                paymentInfo: creditCardData
            }).then(() => {
                // After making the server calls, navigate NEXT in the flow
            }).catch((error) => {
                this._creditCardErrorMessage = error.body.message;
            });
        }
        return output;
    }


    /**
     * Naviagte to the order confirmation page
     * @param navigationContext lightning naviagtion context
     * @param orderNumber the order number from place order api response
     */
    navigateToOrder(orderNumber) {
        this[NavigationMixin.Navigate]({
        type: "comm__namedPage",
        attributes: {
            name: "Order"
        },
        state: {
            orderNumber: orderNumber
        }
        });
    }

    /**
     * Determines if you are in the experience builder currently
     */
    isInSitePreview() {
        let url = document.URL;

        return (
        url.indexOf("sitepreview") > 0 ||
        url.indexOf("livepreview") > 0 ||
        url.indexOf("live-preview") > 0 ||
        url.indexOf("live.") > 0 ||
        url.indexOf(".builder.") > 0
        );
    }

//*************Checkout Special Handling Done.**********************/

    // Private attributes
    _addresses;
    _creditCardErrorMessage;
    _purchaseOrderErrorMessage = '';
    _cartId;
    _purchaseOrderNumber;
    _selectedBillingAddress;
    _selectedPaymentType = Constants.PaymentTypeEnum.PONUMBER;

    /**
     * Comes from the flow itself and only available in flow. Given this component is only designed
     * for use in flows, this is probably fine. The actions will tell us if "Previous" is available
     * so we can display the "Previous" button only when it's available.
     */
    @api availableActions;

    /**
     * Determines if Purchase Order is a required field.
     * @type {Boolean}
     */
    @api poRequired = false;

    /**
     * Determines if Card Holder Name is a required field.
     * @type {Boolean}
     */
    @api cardHolderNameRequired = false;

    /**
     * Determines if Card Type is a required field.
     * @type {Boolean}
     */
    @api cardTypeRequired = false;

    /**
     * Determines if Expiry Month is a required field.
     * @type {Boolean}
     */
    @api expiryMonthRequired = false;

    /**
     * Determines if Expiry Year is a required field.
     * @type {Boolean}
     */
    @api expiryYearRequired = false;

    @api expiryRequired = false;

    /**
     * Determines if CVV is a required field.
     * @type {Boolean}
     */
    @api cvvRequired = false;

    /**
     * Determines if Card Holder Name is a hidden field.
     * @type {Boolean}
     */
    @api hideCardHolderName = false;
    
    @api hideExpiry = false;
    /**
     * Determines if Card Type is a hidden field.
     * @type {Boolean}
     */
    @api hideCardType = false;

    /**
     * Determines if CVV is a hidden field.
     * @type {Boolean}
     */
    @api hideCvv = false;

    /**
     * Determines if Expiry Month is a hidden field.
     * @type {Boolean}
     */
    @api hideExpiryMonth = false;

    /**
     * Determines if Expiry Year is a hidden field.
     * @type {Boolean}
     */
    @api hideExpiryYear = false;


    /**
     * Determines if Purchase Order is a hidden option.
     * @type {Boolean}
     */
    @api hidePurchaseOrder = false;

    /**
     * Determines if Credit Card is a hidden option.
     * @type {Boolean}
     */
    @api hideCreditCard = false;

    /**
     * The list of labels used in the cmp.
     * @type {String}
     */
    get labels() {
        return Constants.labels;
    }

    /**
     * Gets or sets the currently selected payment type.
     *
     * The value of this property is updated in response to user interactions with the control.
     *
     * @type {String}
     */
    @api
    get selectedPaymentType() {
        return this._selectedPaymentType;
    }

    set selectedPaymentType(newPaymentType) {
        this._selectedPaymentType = newPaymentType;
    }

    /**
     * The purchase order number. Used to pass the purchase order to the server and to
     * display the existing purchase order when the component loads.
     *
     * The value of this property is updated in response to user interactions with the control.
     *
     * @type {string}
     */
    @api
    get purchaseOrderNumber() {
        return this._purchaseOrderNumber;
    }

    set purchaseOrderNumber(newNumber) {
        this._purchaseOrderNumber = newNumber;
    }

    /**
     * The address data. Used to pass the user's addresses to the child billing address components.
     * @type {Address[]}
     */
    @api
    get addresses() {
        return this._addresses;
    }

    set addresses(billingAddresses) {
        this._addresses = billingAddresses;
    }

    /**
     * Gets or sets the selected billing address.
     * @type {String}
     */
    @api
    get selectedBillingAddress() {
        return this._selectedBillingAddress;
    }

    set selectedBillingAddress(address) {
        this._selectedBillingAddress = address;
    }

    /**
     * Determines if Billing Address is a hidden field.
     * @type {Boolean}
     */
    @api hideBillingAddress = false;

    /**
     * Determines if the billing address field should be marked required.
     * @type {Boolean}
     */
    @api billingAddressRequired = false;

    /**
     * The error message string if there is an error with displaying billing addresses.
     * Errors that are possible are no access to web cart/ no access to CPA/ or no billing addresses in the list.
     *
     * @type {String}
     */
    @api billingAddressErrorMessage;

    /**
     * The cartId for the current webCart.
     * @return {String} the webCartID
     */
    @api
    get cartId() {
        return this._cartId;
    }

    /**
     * Sets the cartId of the current webCart.
     * @param {String} cartId
     */
    set cartId(cartId) {
        this._cartId = cartId;
        if (cartId) {
            this.initializePaymentData(cartId);
        }
    }

    /**
     * Gets the payment types
     * PO Number or Card Payment
     */
    get paymentTypes() {
        return {
            poNumber: Constants.PaymentTypeEnum.PONUMBER,
            cardPayment: Constants.PaymentTypeEnum.CARDPAYMENT
        };
    }

    /**
     * Get state of selected payment type
     * @return {boolean} true if selected payment type is Card Payment
     */
    get isCardPaymentSelected() {
        return (
            this.actualSelectedPaymentType ===
                Constants.PaymentTypeEnum.CARDPAYMENT && !this.hideCreditCard
        );
    }

    /**
     * Get state of selected payment type
     * @return {boolean} true if selected payment type is PO number
     */
    get isPoNumberSelected() {
        return (
            this.actualSelectedPaymentType ===
                Constants.PaymentTypeEnum.PONUMBER && !this.hidePurchaseOrder
        );
    }

    /**
     * Get the selected payment type.
     * If hidePurchaseOrder is true, default to cardPayment.
     * if hideCreditCard is true, default to PurchaseOrderNumber.
     * @private
     */
    get actualSelectedPaymentType() {
        return this.hidePurchaseOrder
            ? Constants.PaymentTypeEnum.CARDPAYMENT
            : this.hideCreditCard
            ? Constants.PaymentTypeEnum.PONUMBER
            : this._selectedPaymentType;
    }

    /**
     * Handler to initialize the payment component
     * @param {String} cartId - the current webCart ID
     */
    initializePaymentData(cartId) {
        // If we don't have those values yet
        getPaymentInfo({ cartId: cartId })
            .then((data) => {
                this._purchaseOrderNumber = data.purchaseOrderNumber;
                this._addresses = data.addresses;
            })
            .catch((error) => {
                //do nothing, continue as normal
                console.log(error.body.message);
            });
    }

    /**
     * Handler for the 'blur' event fired from the purchase order input.
     */
    handleUpdate() {
        const poComponent = this.getComponent('[data-po-number]');
        const poData = (poComponent.value || '').trim();
        this._purchaseOrderNumber = poData;
    }

    /**
     * Handler for the 'click' event fired from the payment type radio buttons.
     * @param {event} event - The selected payment type
     */
    handlePaymentTypeSelected(event) {
        this._selectedPaymentType = event.currentTarget.value;
    }

    /**
     * @returns The selected billing address in an object { address: <the selected billing address> } or
     *          { error: <the error message> } if the field is required but missing. It can return an empty
     *          object if there is no billing address and it's not a required field.
     */
    getBillingAddress() {
        if (!Array.isArray(this._addresses) || !this._addresses.length) {
            if (this.billingAddressRequired) {
                return { error: 'Billing Address is required' };
            }
        } else {
            return {
                address: this._addresses.filter(
                    (add) => add.id === this.selectedBillingAddress
                )[0]
            };
        }

        return {};
    }

    getCreditCardFromComponent(creditPaymentComponent) {
        const cardPaymentData = {};
        [
            'cardHolderName',
            'cardNumber',
            'cvv',
            'expiryYear',
            'expiryMonth',
            'cardExpiry',
            'cardType'
        ].forEach((property) => {
            cardPaymentData[property] = creditPaymentComponent[property];
        });
        console.log('566 cardPaymentData'+JSON.stringify(cardPaymentData))
        return cardPaymentData;
    }

    /**
     * Set the address selected
     */
    handleChangeSelectedAddress(event) {
        const address = event.detail.address;
        if (address.id !== null && address.id.startsWith('8lW')) {
            this._selectedBillingAddress = address.id;
        } else {
            this._selectedBillingAddress = '';
        }
    }

    /**
     * Simple function to query the passed element locator
     * @param {*} locator The HTML element identifier
     * @private
     */
    getComponent(locator) {
        return this.template.querySelector(locator);
    }
}