trigger LiveChatTranscriptTrigger on LiveChatTranscript (after insert) {
if (Trigger.isAfter && Trigger.isInsert) {
       // LiveChatTranscriptHandler.handleAfterInsert(Trigger.new);
    }
}