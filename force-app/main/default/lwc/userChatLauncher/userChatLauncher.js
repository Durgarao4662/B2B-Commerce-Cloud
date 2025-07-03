import { LightningElement, wire } from 'lwc';
import getUserInfo from '@salesforce/apex/LoggedInUserInfoController.getUserInfo';

export default class UserChatLauncher extends LightningElement {
    userName;
    userEmail;

    @wire(getUserInfo)
    wiredUser({ data, error }) {
        if (data) {
            this.userName = `${data.FirstName} ${data.LastName}`;
            this.userEmail = data.Email;
            this.loadChatScript();
        } else if (error) {
            console.error('Error fetching user info: ', error);
        }
    }

    loadChatScript() {
        // Wait for Embedded Service to be available
        if (!window.embedded_svc) {
            console.error('Embedded Service not loaded.');
            return;
        }

        embedded_svc.settings.prepopulatedPrechatFields = {
            FirstName: this.userName,
            Email: this.userEmail
        };

        embedded_svc.settings.extraPrechatFormDetails = [
            {
                label: "Name",
                value: this.userName,
                transcriptFields: ["Name__c"],
                displayToAgent: true
            },
            {
                label: "Email",
                value: this.userEmail,
                transcriptFields: ["Email__c"],
                displayToAgent: true
            }
        ];

        embedded_svc.settings.skipPrepopulatedPrechatFieldsValidation = true;

        embedded_svc.init(
            'https://vcpracticedev-dev-ed.develop.my.salesforce.com',
            'https://vcpracticedev-dev-ed.develop.lightning.force.com',
            window.gslbBaseURL,
            'live_agent_setup_flow',
            {
                baseLiveAgentContentURL: 'https://vcpracticedev-dev-ed.develop.salesforceliveagent.com/content',
                deploymentId: '572fK000004MvuzQAC',
                buttonId: '573fK000000XUwzQAG',
                baseLiveAgentURL: 'https://vcpracticedev-dev-ed.develop.salesforceliveagent.com/chat',
                eswLiveAgentDevName: 'Chat_Group',
                isOfflineSupportEnabled: false
            }
        );
    }
}