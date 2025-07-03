import { LightningElement, api, track } from 'lwc';
import registerForCampaign from '@salesforce/apex/CampaignMemberController.registerForCampaign';
import getAvailableCampaigns from '@salesforce/apex/CampaignMemberController.getAvailableCampaigns';

export default class RegisterForEvent extends LightningElement {
    @track campaigns = []; // List of available campaigns
    @track selectedCampaignId = ''; // The selected campaign ID
    @track message = ''; // Success or error message
    @track isLoading = false; // Loading spinner
    @track isError = false; // Tracks if the message is an error
   
    connectedCallback() {
        this.fetchCampaigns();
    }
   
    // Fetch the list of available campaigns
fetchCampaigns() {
    this.isLoading = true;
    getAvailableCampaigns()
        .then((result) => {
            this.campaigns = result.map(campaign => ({
                id: campaign.id,
                name: campaign.campaignName,
                description: campaign.description,
                address: campaign.eventAddress,
                //startDate: campaign.StartDate,
                //endDate: campaign.EndDate,
                eventDateTime: campaign.eventDateTimeFormatted
            }));
            console.log('campaigns::'+JSON.stringify(this.campaigns));
        })
        .catch((error) => {
            this.message = 'Error fetching campaigns: ' + error.body.message;
            this.isError = true; // Set message type to error
        })
        .finally(() => {
            this.isLoading = false;
        });
}
   
    // Handle campaign selection
    handleCampaignChange(event) {
        this.selectedCampaignId = event.target.value;
    }
   
    // Handle registration
    handleRegister(event) {
        const campaignId = event.target.dataset.id; // Get the campaign ID from the button's data attribute
        this.isLoading = true;
        console.log('campaignId:'+campaignId);
        // if (!this.selectedCampaignId) {
        //     this.message = 'Please select a campaign to register.';
        //     return;
        // }
   
        registerForCampaign({ campaignId })
            .then((result) => {
                this.message = result; // Display success or error message
                this.fetchCampaigns();
            })
            .catch((error) => {
                this.message = 'Error: ' + error.body.message;
                this.isError = true; // Set message type to error
            })
            .finally(() => {
                this.isLoading = false;
            });
    }
    get messageClass() {
        return this.isError ? 'error-message' : 'success-message';
     }
   }