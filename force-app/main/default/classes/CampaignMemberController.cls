public with sharing class CampaignMemberController {
    // Wrapper class to hold the formatted data
    public class CampaignMemberWrapper {
        @AuraEnabled public String id;
        @AuraEnabled public String campaignName;
        @AuraEnabled public String eventAddress;
        @AuraEnabled public String eventDateTimeFormatted; // Formatted Event Date/Time
        @AuraEnabled public String status;
        @AuraEnabled public String createdDateFormatted; // Formatted Created Date
        @AuraEnabled public String description;
    }
 
    /**
     * Fetch Campaign Members for a given Contact ID.
 * @param contactId The ID of the Contact whose Campaign Members need to be fetched.
     * @return A list of CampaignMemberWrapper objects with formatted fields.
     */
    @AuraEnabled(cacheable=true)
    public static List<CampaignMemberWrapper> getCampaignMembersForContact(Id contactId) {
        // Null check for contactId
        if(contactId == null) {
            return new List<CampaignMemberWrapper>();
        }
 
        // Query CampaignMember details for the given Contact ID
        List<CampaignMember> campaignMembers = [
            SELECT Id, 
                   Campaign.Name, 
                   Event_Address__c,    
                   Event_Date_Time__c, 
                   Status, 
                   CreatedDate
            FROM CampaignMember
            WHERE ContactId = :contactId
            ORDER BY CreatedDate DESC
        ];
 
        // Create a list of wrapper objects
        List<CampaignMemberWrapper> wrappedCampaignMembers = new List<CampaignMemberWrapper>();
 
        for (CampaignMember cm : campaignMembers) {
            CampaignMemberWrapper wrapper = new CampaignMemberWrapper();
            wrapper.id = cm.Id;
            wrapper.campaignName = cm.Campaign.Name;
            wrapper.eventAddress = cm.Event_Address__c;
 
            // Format Event_Date_Time__c
            if (cm.Event_Date_Time__c != null) {
                wrapper.eventDateTimeFormatted = cm.Event_Date_Time__c.format('MMMM dd, yyyy hh:mm:ss a', 'en_US');
            } else {
                wrapper.eventDateTimeFormatted = null;
            }
 
            // Format CreatedDate
            wrapper.createdDateFormatted = cm.CreatedDate.format('MMMM dd, yyyy hh:mm:ss a', 'en_US');
 
            wrapper.status = cm.Status;
 
            wrappedCampaignMembers.add(wrapper);
        }
 
        return wrappedCampaignMembers;
    }
 
    /**
     * Fetch the Contact ID of the currently logged-in user.
     * @return The Contact ID of the logged-in user, or null if the user does not have an associated Contact.
     */
    @AuraEnabled(cacheable=true)
    public static Id getContactId() {
        User user = [SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId()];
        // Return null if the user not have an associated Contact
        return user.ContactId;
    }

    @AuraEnabled(cacheable=true)
    public static List<CampaignMemberWrapper> getAvailableCampaigns() {
        // Fetch campaigns that are active and criteria
        List<Campaign> campaigns = [
            SELECT Id, Name, Description, Event_Address__c, StartDate, EndDate, Event_Date_Time__c 
            FROM Campaign 
            WHERE IsActive = true AND Type = 'Conference'
            ORDER BY StartDate ASC
        ];

// Create a list of wrapper objects
List<CampaignMemberWrapper> wrappedCampaigns = new List<CampaignMemberWrapper>();
 
for (Campaign cam : campaigns) {
    CampaignMemberWrapper wrapper = new CampaignMemberWrapper();
    wrapper.id = cam.Id;
    wrapper.campaignName = cam.Name;
    wrapper.eventAddress = cam.Event_Address__c;
    wrapper.description = cam.Description;

    // Format Event_Date_Time__c
    if (cam.Event_Date_Time__c != null) {
        wrapper.eventDateTimeFormatted = cam.Event_Date_Time__c.format('MMMM dd, yyyy hh:mm:ss a', 'en_US');
    } else {
        wrapper.eventDateTimeFormatted = null;
    }

    // Format CreatedDate
   // wrapper.createdDateFormatted = cm.CreatedDate.format('MMMM dd, yyyy hh:mm:ss a', 'en_US');

   wrappedCampaigns.add(wrapper);
}

return wrappedCampaigns;

    }

    @AuraEnabled
 public static String registerForCampaign(Id campaignId) {
     // Get the logged-in user's Contact ID
     Id contactId = [SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId()].ContactId;

     if (contactId == null) {
         throw new AuraHandledException('You must be associated with a Contact to register for this event.');
     }

     // Check if the user is already registered
     List<CampaignMember> existingMembers = [
         SELECT Id 
         FROM CampaignMember 
         WHERE CampaignId = :campaignId AND ContactId = :contactId
     ];

     if (!existingMembers.isEmpty()) {
         return 'You are already registered for this event.';
     }

     // Create a new CampaignMember record
     CampaignMember cm = new CampaignMember();
     cm.CampaignId = campaignId;
     cm.ContactId = contactId;

     try {
         insert cm;
         return 'You have successfully registered for the event!';
     } catch (Exception e) {
         throw new AuraHandledException('An error occurred while registering: ' + e.getMessage());
     }
 }
 }