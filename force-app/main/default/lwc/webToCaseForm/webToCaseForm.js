import { LightningElement } from 'lwc';

export default class WebToCaseForm extends LightningElement {
    orgId = '00DfK000008cYOO'; // Your Salesforce Org ID
    retURL = 'https://vcpracticedev-dev-ed.develop.my.site.com/loyaltysupport/s/thank-you-page'; // Replace with your confirmation page

    handleSubmit(event) {
        event.preventDefault();

        const fields = event.target.elements;
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'https://webto.salesforce.com/servlet/servlet.WebToCase?encoding=UTF-8';

        // Hidden inputs
        form.innerHTML += `<input type="hidden" name="orgid" value="${this.orgId}">`;
        form.innerHTML += `<input type="hidden" name="retURL" value="${this.retURL}">`;

        // User inputs
        form.innerHTML += `<input type="hidden" name="name" value="${fields.name.value}">`;
        form.innerHTML += `<input type="hidden" name="email" value="${fields.email.value}">`;
        form.innerHTML += `<input type="hidden" name="phone" value="${fields.phone.value}">`;
        form.innerHTML += `<input type="hidden" name="subject" value="${fields.subject.value}">`;
        form.innerHTML += `<input type="hidden" name="description" value="${fields.description.value}">`;

        document.body.appendChild(form);
        form.submit();
    }
}