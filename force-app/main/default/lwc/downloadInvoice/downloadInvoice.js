import { LightningElement,api } from 'lwc';


export default class DownloadInvoice extends LightningElement {

    @api ordernumber;


    downloadInvoice(){
       console.log("Button clicked");
       console.log("Order Id is :"+this.ordernumber);
        let url = 'https://vcpracticedev-dev-ed.develop.my.site.com/b2bdemostorevforcesite/apex/DownloadInvoice?id='+this.ordernumber;
         window.open(url, '_blank');
    }
}