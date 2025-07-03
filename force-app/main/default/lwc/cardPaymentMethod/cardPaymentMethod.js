import { api, LightningElement, track } from 'lwc';
import * as Constants from './constants.js';

//Credit Card view handling
import { Card } from "./card";
import { Payment } from "./payment";

// Card types to label map
const cardTypesObj = {
    Visa: Constants.cardLabels.Visa,
    'Master Card': Constants.cardLabels.MasterCard,
    'American Express': Constants.cardLabels.AmericanExpress,
    'Diners Club': Constants.cardLabels.DinersClub,
    Jcb: Constants.cardLabels.JCB
};

export default class CardPaymentMethod extends LightningElement {
    // Private attributes
    _creditCardErrorMessage;
    _cardHolderName;
    _cardNumber;
    _cardType;
    _cvv;
    _expiryMonth="";
    _expiryYear;
    _isConnected = false;
		
    @track cardNumber = "";
    @track cardHolderName ="";
    @track cardNumberTouched = false;
    @track cardHolderNameTouched = false;
    @track cardCVC = "";
    @track cardCVCTouched = false;
    @track cardCVCValid = false;
    @track cardExpiry = "";
    @track cardExpiryValid = false;
    @track cardExpiryTouched = false;
    @track cardNumberValid = false;
    @track cardHolderNameValid = false;
    @track cardCVCValid = false;

    /**
     * Gets or sets the name of the card holder.
     *
     * The value of this property is updated in response to user interactions with the control.
     *
     * @type {String}
     */
    @api
    get cardHolderName() {
        return this._cardHolderName;
    }

    /**
     * Gets or sets the card type.
     *
     * The value of this property is updated in response to user interactions with the control.
     *
     * @type {String}
     */
    @api
    get cardType() {
        return this._cardType;
    }

    /**
     * Gets or sets the card number.
     *
     * The value of this property is updated in response to user interactions with the control.
     *
     * @type {String}
     */
    @api
    get cardNumber() {
        return this._cardNumber;
    }

    /**
     * Gets or sets the card verification value.
     *
     * The value of this property is updated in response to user interactions with the control.
     *
     * @type {String}
     */
    @api
    get cvv() {
        return this._cvv;
    }

    /**
     * Gets or sets the expiry month of the card.
     *
     * The value of this property is updated in response to user interactions with the control.
     *
     * @type {String}
     */
    @api
    get expiryMonth() {
        return this._expiryMonth;
    }

    /**
     * Gets or sets the expiry year of the card.
     *
     * The value of this property is updated in response to user interactions with the control.
     *
     * @type {String}
     */
    @api
    get expiryYear() {
        return this._expiryYear;
    }

    /**
     * Determines if the card holder name field is required.
     * @type {Boolean}
     */
    @api cardHolderNameRequired = false;

    /**
     * Determines if the card type field is required.
     * @type {Boolean}
     */
    @api cardTypeRequired = false;

    /**
     * Determines if the expiry month field is required.
     * @type {Boolean}
     */
    @api expiryMonthRequired = false;

    /**
     * Determines if the expiry year field is required.
     * @type {Boolean}
     */
    @api expiryYearRequired = false;

    /**
     * Determines if the cvv field is required.
     * @type {Boolean}
     */
    @api cvvRequired = false;

    @api expiryRequired = false;

    /**
     * Determines if the card holder name field should be hidden.
     * @type {Boolean}
     */
    @api hideCardHolderName = false;

    /**
     * Determines if the card type field should be hidden.
     * @type {Boolean}
     */
    @api hideCardType = false;

    /**
     * Determines if the cvv field should be hidden.
     * @type {Boolean}
     */
    @api hideCvv = false;

    /**
     * Determines if the expiry month field should be hidden.
     * @type {Boolean}
     */
    @api hideExpiryMonth = false;

    /**
     * Determines if the expiry year field should be hidden.
     * @type {Boolean}
     */
    @api hideExpiryYear = false;

    @api hideExpiry = false;

    /**
     * Error message which will be displayed in the error section
     * @type {String}
     */
    @api
    get creditCardErrorMessage() {
        return this._creditCardErrorMessage;
    }

    set creditCardErrorMessage(newMessage) {
        this._creditCardErrorMessage = newMessage;
    }

    /**
     * Shows or clears validation errors on inputs that comprise the component, returns true if required
     * fields have been filled.
     *
     * @returns {Boolean}
     *  True if required fields have been filled, false otherwise.
     */
    @api
    reportValidity() {
        if (!this._isConnected) {
            return true;
        }

        const incompleteFields = this.hasIncompleteCardPaymentFields();

        const componentsToValidate = this.template.querySelectorAll(
            '[data-validate]'
        );
        // Need to run .reportValidity on all components to ensure that all errors are shown/cleared at once
        const validateFields = [...componentsToValidate].reduce(
            (result, component) => component.reportValidity() && result,
            true
        );

        return !incompleteFields && validateFields;
    }

    /**
     * Iterates through the credit card fields and checks if any of the fields that are displayed and are required have
     * an empty value. Sets an error on the cardAuthErrorMessage attribute if there is an empty required field.
     *
     * @returns true if there is an empty required field, false otherwise
     * @private
     */
    hasIncompleteCardPaymentFields() {
        const fieldRequiredValueMap = [
            {
                isHiddenAttr: this.hideCardHolderName,
                isRequiredAttr: this.cardHolderNameRequired,
                value: this.cardHolderName,
                error: this.labels.InvalidName
            },
            {
                isHiddenAttr: this.hideCardType,
                isRequiredAttr: this.cardTypeRequired,
                value: this.cardType,
                error: this.labels.InvalidCardType
            },
            {
                isHiddenAttr: false,
                isRequiredAttr: true,
                value: this.cardNumber,
                error: this.labels.InvalidCreditCardNumber
            },
            {
                isHiddenAttr: this.hideCvv,
                isRequiredAttr: this.cvvRequired,
                value: this.cvv,
                error: this.labels.InvalidCvv
            },
            {
                isHiddenAttr: this.hideExpiryMonth,
                isRequiredAttr: this.expiryMonthRequired,
                value: this.expiryMonth,
                error:  this.labels.InvalidExpiryMonth
            },
            {
                isHiddenAttr: this.hideExpiryYear,
                isRequiredAttr: this.expiryYearRequired,
                value: this.expiryYear,
                error: this.labels.InvalidExpiryYear
            },
            {
                isHiddenAttr: this.hideExpiry,
                isRequiredAttr: true,
                value: this.cardExpiry,
                error: this.labels.InvalidExpiryYear
            }
        ];

        const isInvalidField = fieldRequiredValueMap.find((field) => {
            if (!field.isHiddenAttr && field.isRequiredAttr && !field.value) {
                this._creditCardErrorMessage = field.error;
                return true;
            }
            return false;
        });

        return isInvalidField;
    }

    /**
     * Gets years to use in the Expiry Years dropdown
     *
     * @returns {Array} Years from current year to current year + 19
     * @private
     */
    get expiryYears() {
        const expiryYears = [],
            noOfYears = 20;
        let year, i;
        for (
            year = new Date().getFullYear(), i = 0;
            i < noOfYears;
            year++, i++
        ) {
            expiryYears.push({ label: year, value: year.toString() });
        }
        return expiryYears;
    }

    /**
     * Gets months (as integers) to use in the Expiry Month dropdown
     *
     * @returns {Array} An array of integers from 1 - 12
     * @private
     */
    get expiryMonths() {
        const expiryMonths = [],
            noOfMonths = 12;
        for (let month = 1; month <= noOfMonths; month++) {
            expiryMonths.push({ label: month, value: month.toString() });
        }
        return expiryMonths;
    }

    /**
     * Gets an array of supported card types to use in Card Type dropdown
     *
     * @returns {Array} An array of card type strings
     * @private
     */
    get cardTypes() {
        return Object.entries(cardTypesObj).map((keyValue) => ({
            label: keyValue[1],
            value: keyValue[0]
        }));
    }

    /**
     * Gets SLDS classes to use for the Card Number field.  Dependent on if CVV field is hidden.
     *
     * @returns {string} SLDS classe ie. 'slds-size_2-of-3' if CVV visible
     * @private
     */
    get cardNumberClass() {
        const sldsColumnSize = this.hideCvv
            ? 'slds-size_1-of-1'
            : 'slds-size_2-of-3';
        return 'slds-form-element ' + sldsColumnSize;
    }

    // @track cardHolderNameValid = false;
    // @track cardHolderNameTouched = false;
    /**
     * Handler for the when the Card Holder Name input is changed
     * @param {object} event change event
     *
     * @private
     */
    handleCardHolderNameChange(event) {
        this._cardHolderName = event.target.value;
        this.cardHolderName = event.target.value;
        this.cardHolderNameValid = this.getIsValid(this.cardHolderName, "cardHolderName");
        this.cardHolderNameTouched = true;
        this.showFeedback();
        this.checkIfComplete();
        event.target.reportValidity();
    }

    /**
     * Handler for the when the Card Type input is changed
     * @param {object} event change event
     *
     * @private
     */
    handleCardTypeChange(event) {
        this._cardType = event.target.value;
        event.target.reportValidity();
    }

    /**
     * Handler for the when the Card Number input is changed
     * @param {object} event change event
     *
     * @private
     */
    handleCardNumberChange(event) {
        this.cardNumber = event.target.value;
        this.cardNumberTouched = true;
        this.cardNumberValid = this.getIsValid(this.cardNumber, "cardNumber");
        this._cardNumber = event.target.value;
        this.showFeedback();
        this.checkIfComplete();
        event.target.reportValidity();
    }
		

    /**
     * Handler for the when the CVV input is changed
     * @param {object} event change event
     *
     * @private
     */
    handleCvvChange(event) {
        this.cardCVC = event.target.value;
        // this.cardCVCValid = this.getIsValid(this.cardCVC, "cardCVC");
        this.cardCVCTouched = true;
        this._cvv = event.target.value;
        this.cardCVCValid = this.getIsValid(this.cardCVC, "cardCVC");
        this.showFeedback();
        this.checkIfComplete();
        event.target.reportValidity();
    }

    handleExpiryInput(event){
        this.cardExpiry = event.target.value;
        this.cardExpiryTouched = true;
        this.cardExpiryValid = this.getIsValid(this.cardExpiry, "cardExpiry");
        this._expiryMonth = event.target.value;
        this.showFeedback();
        event.target.reportValidity();
    }


    /**
     * Handler for the when the Expiry Month input is changed
     * @param {object} event change event
     *
     * @private
     */
    handleExpiryMonthChange(event) {
        this._expiryMonth = event.target.value;
        this.showFeedback();
        event.target.reportValidity();
    }

    /**
     * Handler for the when the Expiry Year input is changed
     * @param {object} event change event
     *
     * @private
     */
    handleExpiryYearChange(event) {
        this._expiryYear = event.target.value;
        event.target.reportValidity();
    }

    /**
     * Stop event bubbling, by attaching this to onkeyup/down/press handler for
     * the lightning-inputs in the card payment cmp.
     *
     * @private
     */
    preventSensitiveInformationPropagation(keyboardEvent) {
        keyboardEvent.stopPropagation();
    }

    get labels() {
        return Constants.labels;
    }

    connectedCallback() {
        this._isConnected = true;
        //copy public attributes to private ones
        var self = this;
        //debugger;
        window.setTimeout(() => {
        self.card = new Card({
            //reference to this object so will work with web components
            context: self,

            // a selector or DOM element for the form where users will
            // be entering their information
            form: self.template.querySelector(".cc-input"),
            // a selector or DOM element for the container
            // where you want the card to appear
            container: ".cc-wrapper", // *required*

            width: 250, // optional — default 350px
            formatting: true, // optional - default true

            // Strings for translation - optional
            messages: {
            validDate: "valid\ndate", // optional - default 'valid\nthru'
            monthYear: "mm/yyyy" // optional - default 'month/year'
            },

            // Default placeholders for rendered fields - optional
            placeholders: {
            number: "•••• •••• •••• ••••",
            name: "Full Name",
            expiry: "••/••••",
            cvc: "•••"
            },

            masks: {
            cardNumber: "•" // optional - mask card number
            },

            // if true, will log helpful messages for setting up Card
            debug: true // optional - default false
        });
        }, 50);
    }

    // Credit card UI below this point.
    //this syntax means we should be able to leave off 'this'
    checkIfComplete = () => {
        if (
        this.cardNumberValid &&
        this.cardHolderNameValid &&
        this.cardExpiryValid &&
        this.cardCVCValid
        ) {
        //send a message
        const detail = {
            type: "cardComplete",
            value: {
            cardNumber: this.cardNumber,
            cardHolderName: this.cardHolderName,
            cardCVV: this.cardCVC,
            cardExpiry: this.cardExpiry,
            cardType: this.card.cardType
            }
        };
        this.despatchCompleteEvent(detail);
        } else {
        // LCC.sendMessage({ type: 'cardIncomplete' });
        this.despatchIncompleteEvent();
        }
    };

    despatchCompleteEvent(cardData) {
        const changeEvent = new CustomEvent("cardComplete", { detail: cardData });
        this.dispatchEvent(changeEvent);
    }

    despatchIncompleteEvent() {
        const changeEvent = new CustomEvent("cardIncomplete", { detail: {} });
        this.dispatchEvent(changeEvent);
    }

    handlePaymentMethodChange(event) {
        const selectedMethod = event.detail.value;
        const changeEvent = new CustomEvent("paymentMethodChange", {
        detail: { paymentMethod: selectedMethod }
        });
        this.dispatchEvent(changeEvent);
    }

    //this syntax means we should be able to leave off 'this'
    getIsValid = (val, validatorName) => {
        var isValid, objVal;
        if (validatorName === "cardExpiry") {
        objVal = Payment.fns.cardExpiryVal(val);
        isValid = Payment.fns.validateCardExpiry(objVal.month, objVal.year);
        } else if (validatorName === "cardCVC") {
        isValid = Payment.fns.validateCardCVC(val, this.card.cardType);
        } else if (validatorName === "cardNumber") {
        isValid = Payment.fns.validateCardNumber(val);
        } else if (validatorName === "cardHolderName") {
        isValid = val !== "";
        }
        return isValid;
    };
    
    disconnectedCallback() {
        this._isConnected = false;
    }

    showFeedback() {
        if (!this.cardNumberValid && this.cardNumberTouched) {
          //show error label
          this.template.querySelectorAll(".cardNumberError")[0].classList.remove("slds-hide");
          this.template.querySelectorAll(".cardNumberFormElement")[0].classList.add("slds-has-error");
        } else {
          this.template.querySelectorAll(".cardNumberError")[0].classList.add("slds-hide");
          this.template
            .querySelectorAll(".cardNumberFormElement")[0]
            .classList.remove("slds-has-error");
        }
    
        if (!this.cardHolderNameValid && this.cardHolderNameTouched) {
          //show error label
          this.template.querySelectorAll(".cardNameError")[0].classList.remove("slds-hide");
          this.template.querySelectorAll(".cardNameFormElement")[0].classList.add("slds-has-error");
        } else {
          this.template.querySelectorAll(".cardNameError")[0].classList.add("slds-hide");
          this.template.querySelectorAll(".cardNameFormElement")[0].classList.remove("slds-has-error");
        }
    
        if (!this.cardExpiryValid && this.cardExpiryTouched) {
          //show error label
          this.template.querySelectorAll(".cardExpiryError")[0].classList.remove("slds-hide");
          this.template.querySelectorAll(".cardExpiryFormElement")[0].classList.add("slds-has-error");
        } else {
          this.template.querySelectorAll(".cardExpiryError")[0].classList.add("slds-hide");
          this.template
            .querySelectorAll(".cardExpiryFormElement")[0]
            .classList.remove("slds-has-error");
        }
    
        if (!this.cardCVCValid && this.cardCVCTouched) {
          //show error label
          this.template.querySelectorAll(".cardCVVError")[0].classList.remove("slds-hide");
          this.template.querySelectorAll(".cardCVVFormElement")[0].classList.add("slds-has-error");
        } else {
          this.template.querySelectorAll(".cardCVVError")[0].classList.add("slds-hide");
          this.template.querySelectorAll(".cardCVVFormElement")[0].classList.remove("slds-has-error");
        }
      }
}