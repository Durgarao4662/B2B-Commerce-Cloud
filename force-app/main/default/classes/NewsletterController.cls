// NewsletterController.cls
public class NewsletterController {
    @AuraEnabled
    public static void subscribe(String email) {
        List<Contact> conListRecord = new List<Contact>();
        Id userId = UserInfo.getUserId();
        List<User> conList = [SELECT ContactId FROM User WHERE Id = :userId LIMIT 1];
        for(User conId: conList){
            Contact contact = new Contact();
            contact.id =  conId.contactId;
            contact.Newsletter__c = true;
            contact.Newsletter_Email__c = email;
            System.debug('User Contact Id: ' + contact.id);
            conListRecord.add(contact);
        }
        update conListRecord;
        System.debug('Subscribed: ' + email);

    }

}