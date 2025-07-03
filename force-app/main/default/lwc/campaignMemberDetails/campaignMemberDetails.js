import { LightningElement, wire } from 'lwc';
import getCampaignMembersForContact from '@salesforce/apex/CampaignMemberController.getCampaignMembersForContact';
import getContactId from '@salesforce/apex/CampaignMemberController.getContactId';

export default class CampaignMemberDetails extends LightningElement {
campaignMembers = [];
error;
contactId;

// Fetch the Contact ID of the logged-in user
@wire(getContactId)
wiredContact({ error, data }) {
    if (data) {
        this.contactId = data;
        console.log('Contact ID:', this.contactId); // Debugging: Log the Contact ID
        this.fetchCampaignMembers(); // Fetch campaign members once contactId is available
    } else if (error) {
        console.error('Error fetching Contact ID:', error);
    }
}

// Fetch Campaign Member details using the Apex method
fetchCampaignMembers() {
    if (this.contactId) {
        console.log('Fetching Campaign Members for Contact ID:', this.contactId); // Debugging
        getCampaignMembersForContact({ contactId: this.contactId })
            .then((data) => {
                console.log('Campaign Members Data:', data); // Debugging: Log the returned data
                if (data.length === 0) {
                    console.warn('No Campaign Members found for this Contact ID:', this.contactId); // Warn if no records are found
                }
                this.campaignMembers = data;
                this.error = undefined;
            })
            .catch((error) => {
                console.error('Error fetching Campaign Members:', error); // Debugging: Log the error
                this.error = error;
                this.campaignMembers = undefined; // Set to undefined on error
            });
    } else {
        console.warn('Contact ID is not available. Cannot fetch Campaign Members.');
    }
}
}