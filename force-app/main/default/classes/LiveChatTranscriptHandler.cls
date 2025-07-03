public class LiveChatTranscriptHandler {
    
    public static void handleAfterInsert(List<LiveChatTranscript> newTranscripts) {
       Id currentUserId = UserInfo.getUserId();
	   User currentUser = [SELECT Id, ContactId FROM User WHERE Id = :currentUserId LIMIT 1];
       System.debug('Current Logged In User::'+currentUserId);
       Id contactId = currentUser.ContactId;
        if(contactId != null){
            LiveChatTranscript chatTranscript = new LiveChatTranscript();
            for(LiveChatTranscript chat:newTranscripts){
                System.debug('LiveChatTranscript::'+newTranscripts);
                chatTranscript.Id = chat.Id;
                chatTranscript.contactId = contactId;
            }
            if(chatTranscript != null){
                System.debug('Update Chat Transcript::'+chatTranscript);
                update chatTranscript;
            }
        }
    }
}