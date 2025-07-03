import { LightningElement, wire } from 'lwc';
import USER_ID from '@salesforce/user/Id';
import { getRecord } from 'lightning/uiRecordApi';

// Add ContactId to the list of fields
const FIELDS = ['User.LastName', 'User.ContactId'];

export default class UserInfoStorage extends LightningElement {
    @wire(getRecord, { recordId: USER_ID, fields: FIELDS })
    wiredUser({ error, data }) {
        if (data) {
            const lastName = data.fields.LastName?.value || '';
            const contactId = data.fields.ContactId?.value || '';

            // Log and store values
            console.log('User LastName:', lastName);
            console.log('User ContactId:', contactId);

            // Store in sessionStorage
            sessionStorage.setItem('CurrentUserFullName', lastName);
            sessionStorage.setItem('CurrentUserContactId', contactId);
        } else if (error) {
            console.error('Error fetching user data:', error);
        }
    }
}