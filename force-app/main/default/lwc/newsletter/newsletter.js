import { LightningElement, track, wire } from 'lwc';
import subscribe from '@salesforce/apex/NewsletterController.subscribe';

export default class Newsletter extends LightningElement {
    @track email = '';
    success=false;
    @track successMsg;
    handleEmailChange(event) {
        this.email = event.target.value;
    }

    subscribe() {
        subscribe({ email: this.email })
            .then(result => {
                // Handle success (if needed).
               // console.log('Subscription success:', result);
                // this.contactSuccess();
                this.success = true;
                this.successMsg = 'Thank you for subscribing!';
            })
            .catch(error => {
                console.error('Subscription error:', error);
            });
    }
}