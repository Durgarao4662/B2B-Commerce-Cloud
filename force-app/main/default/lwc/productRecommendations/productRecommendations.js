import { LightningElement, api, track, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { getRecord } from 'lightning/uiRecordApi';
import USER_ID from '@salesforce/user/Id';
import communityId from '@salesforce/community/Id';
import addToCart from '@salesforce/apex/B2BGetInfo.addToCart';
import getRecommendation from '@salesforce/apex/GetRecommendationProducts.getRecommendation';
import getCartSummary from '@salesforce/apex/B2BGetInfo.getCartSummary';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import LightningAlert from 'lightning/alert';
import { NavigationMixin } from 'lightning/navigation';

const FIELDS = ['User.Email'];
export default class ProductRecommendations extends NavigationMixin(LightningElement) {
    
	@track recordId;
	userEmail;
	@track isModalOpen=false;
	@track cartId;
	constructor() {
		super();
	}
	connectedCallback() {      
		this.getRecordId();
		this.updateCartInformation();
	}

	disconnectedCallback(){

	}

	/**
     * The cart summary information
     *
     * @type {ConnectApi.CartSummary}
     * @private
     */
	cartSummary;

	productLists = [];
	@api
	get effectiveAccountId() {
			return this._effectiveAccountId;

	}		
	@wire(CurrentPageReference)
	setCurrentPageReference(currentPageReference) {
		this.currentPageReference = currentPageReference;
		this.getRecordId();
		this.updateCartInformation();
		};

	@wire(getRecord, {recordId: USER_ID, fields: FIELDS })
	wiredUser({ error, data }) {
		if (data) {
				this.userEmail = data.fields.Email.value;
		} else if (error) {
				console.error('Error fetching user email:', error);
		}
	}
	/**
	* Sets the effective account - if any - of the user viewing the product
	* and fetches updated cart information
	*/
	set effectiveAccountId(newId) {
		this._effectiveAccountId = newId;
		this.updateCartInformation();
	}

	get _isCartLocked() {
		const cartStatus = (this.cartSummary || {}).status;
		return cartStatus === 'Processing' || cartStatus === 'Checkout';
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

	getRecordId(){
		this.recordId = this.currentPageReference.attributes.recordId;
		if(this.recordId){
			this.getRecommendationList(this.recordId);
		}
	}
	// Fetch the other products from the view product category
	getRecommendationList(recordId){
		getRecommendation({
				communityId: communityId,
				productId: recordId,
				effectiveAccountId: this.effectiveAccountId
		}).then(result =>{
			this.productLists = result;
		}).catch(error =>{
				console.log('error:: '+JSON.stringify(error));
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
			this.isModalOpen = true;
			}).catch((e) => {
				console.log('line 190 error '+e);
			});
	}

	updateCartInformation() {
		getCartSummary({
			communityId: communityId,
			effectiveAccountId: this.resolvedEffectiveAccountId
		})
			.then((result) => {
				this.cartSummary = result;
				this.cartId = this.cartSummary.cartId;					
			})
			.catch((e) => {
				console.log(e);
			});
	}
	// Product Detail Navigation
	handleProductDetailNavigation(event) {
		console.log('Image Clicked'+JSON.stringify(event))
		event.preventDefault();
		const productId = event.currentTarget.dataset.id;
		console.log('Image Clicked product ID '+productId)
		this[NavigationMixin.Navigate]({
			type: 'standard__recordPage',
			attributes: {
				recordId: productId,
				objectApiName: 'Product2',
				actionName: 'view'
			}
		});
		this.getRecommendationList(productId);
	}
	openModal() {
		// to open modal set isModalOpen tarck value as true
		this.isModalOpen = true;
	}
	closeModal() {
		// to close modal set isModalOpen tarck value as false
		this.isModalOpen = false;
	}
	navigateToCart() {
		// to close modal set isModalOpen tarck value as false
		//Add your code to call apex method or do some processing
		//this.isModalOpen = false;
		this[NavigationMixin.Navigate]({
			type: 'standard__webPage',
			attributes: {
				url: '/cart'
			}
		});
	}

	
}