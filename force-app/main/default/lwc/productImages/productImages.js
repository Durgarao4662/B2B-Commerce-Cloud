import { LightningElement, api, track, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import communityId from '@salesforce/community/Id';
import getProduct from '@salesforce/apex/B2BGetInfo.getProduct';

export default class ProductImages extends LightningElement {


    @wire(CurrentPageReference)
	setCurrentPageReference(currentPageReference) {
    this.currentPageReference = currentPageReference;
    this.getRecordId();
        if (this.connected) {
            // We need to have the currentPageReference, and to be connected before
            // we can use NavigationMixin
        } else {
            // NavigationMixin doesn't work before connectedCallback, so if we have 
            // the currentPageReference, but haven't connected yet, queue it up
            this.generateUrlOnConnected = true;            
        }
    };
    
    @track recordId;
    product;

    getRecordId(){
		this.recordId = this.currentPageReference.attributes.recordId;
        if(this.recordId){
            this.getProductData(this.recordId);
        }
	}

    //This get call at element load.
    connectedCallback() {
        this.getRecordId();     
    }
    disconnectedCallback(){

    }

    @api
	get effectiveAccountId() {
		return this._effectiveAccountId;
	}

    set effectiveAccountId(newId) {
		this._effectiveAccountId = newId;
	}

	getProductData(recordId){
		getProduct({
            communityId: communityId,
            productId: recordId,
            effectiveAccountId: this.effectiveAccountId
		}).then(result =>{
			this.product = result;
		}).catch(error =>{
				console.log('error:: '+JSON.stringify(error));
		});
	}

    /**
     * Gets whether product information has been retrieved for display.
     *
     * @type {Boolean}
     * @readonly
     * @private
     */
    get hasProduct() {
        return this.product !== undefined;
    }

    get getProductImages(){
        const altImages = [];
        let altImage ={};
        let mediaGroups = this.product.mediaGroups;

        mediaGroups.forEach(mediaGroup => {
            if(mediaGroup.developerName =='productDetailImage'){
                let mediaItems = mediaGroup.mediaItems;
                mediaItems.forEach(mediaItem => {
                    altImage = {
                        url : mediaItem.url,
                        alternateText : mediaItem.alternateText
                    }
                    altImages.push(altImage);
                });
            }
        });
        return altImages;
    }
    /**
     * Gets the normalized, displayable product information for use by the display components.
     *
     * @readonly
     */
    get displayableProduct() {
        return {
            categoryPath: this.product.primaryProductCategoryPath.path.map(
                (category) => ({
                    id: category.id,
                    name: category.name
                })
            ),
            description: this.product.fields.Description,
            image: {
                alternativeText: this.product.defaultImage.alternativeText,
                url: this.product.defaultImage.url
            },
            name: this.product.fields.Name,
            sku: this.product.fields.StockKeepingUnit,
            
        };
    } 

    swapImage(event){
        event.preventDefault();
        let mainImageobj = this.template.querySelector('[data-name="myDiv"]');
        const thumb_obj_src = event.target.src;
        mainImageobj.src = thumb_obj_src;
        // //main = document.getElementById('').getElementsByTagName('IMG')[0];
        // let main = this.template.querySelector(".imgHolder");
        
        // let childsrc = mainImageobj.src;
        // console.log('This is main obj', mainImageobj)
        // console.log('This is child src obj', childsrc)

        // console.log('This is thumb', thumb_obj_src) 
        // console.log('This is thumbobj', thumb_obj)
        // // thumb_obj=thumb_obj.getElementsByTagName('IMG')[0],
        // // thumb_src=thumb_obj.src;
        // // main.src=thumb_src;
    }

}