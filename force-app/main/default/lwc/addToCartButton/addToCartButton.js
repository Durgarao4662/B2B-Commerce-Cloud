import { LightningElement, api, track, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import communityId from '@salesforce/community/Id';
import addToCart from '@salesforce/apex/B2BGetInfo.addToCart';
import LightningAlert from 'lightning/alert';
import getCartSummary from '@salesforce/apex/B2BGetInfo.getCartSummary';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


const FIELDS = ['User.Email'];
export default class AddToCartButton extends LightningElement () {  
	/**
	 * The cart summary information
	 *
	 * @type {ConnectApi.CartSummary}
	 * @private
	 */
	cartSummary;
	
	@api
	get effectiveAccountId() {
		return this._effectiveAccountId;
	}


	@wire(CurrentPageReference)
	currentPageReference;

	connectedCallback() {      
		this.updateCartInformation();	
	}
	disconnectedCallback(){

	}

	get _isCartLocked() {
		const cartStatus = (this.cartSummary || {}).status;
		return cartStatus === 'Processing' || cartStatus === 'Checkout';
	}
	/**
	* Sets the effective account - if any - of the user viewing the product
	* and fetches updated cart information
	*/
	set effectiveAccountId(newId) {
		this._effectiveAccountId = newId;
		this.updateCartInformation();
	}

	/**
	 * Gets the normalized effective account of the user.
	 *
	 * @type {string}
	 * @readonly
	 * @private
	 */
	get resolvedEffectiveAccountId() {
		const effectiveAccountId = this.effectiveAccountId || '';
		let resolved = null;
		if (
			effectiveAccountId.length > 0 &&
			effectiveAccountId !== '000000000000000'
		) {
			resolved = effectiveAccountId;
		}
		return resolved;
	}



	showToast() {
		const event = new ShowToastEvent({
			title: 'Get Help',
			message:
				'Salesforce documentation is available in the app. Click ? in the upper-right corner.',
		});
		this.dispatchEvent(event);
	}
	// Show Cart Update Pop-up.
	async handleAlertClick() {
		await LightningAlert.open({
			message: 'Your cart has been updated.',
			theme: 'success', // a red theme intended for error states
			label: 'Success!', // this is the header text
		});
	}

	notifyAddToCart(event) {
		let productSet = event.currentTarget.dataset;
		this.addToCart(productSet);
	}

	addToCart(productSet) {
		addToCart({
			communityId: communityId,
			productId: productSet.id,
			quantity: 1,
			effectiveAccountId: this.resolvedEffectiveAccountId
		}).then(() => {
			this.handleAlertClick();
			}).catch((e) => {
			this.dispatchEvent(
				new ShowToastEvent({
					title: 'Error',
					message:
						'{0} could not be added to your cart at this time. Please try again later.',
					messageData: productSet.Name,
					variant: 'error',
					mode: 'dismissable'
				})
			);
		});
	}

	updateCartInformation() {
		getCartSummary({
			communityId: communityId,
			effectiveAccountId: this.resolvedEffectiveAccountId
		})
		.then((result) => {
			this.cartSummary = result;
			//console.log('cart summary result:: '+ JSON.stringify(result));
		})
		.catch((e) => {
			// Handle cart summary error properly
			// For this sample, we can just log the error
			console.log('cart summary error '+ JSON.stringify(e));
		});
	}
}