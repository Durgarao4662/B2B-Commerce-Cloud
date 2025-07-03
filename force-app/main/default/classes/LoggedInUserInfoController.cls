public with sharing class LoggedInUserInfoController {
    @AuraEnabled(cacheable=true)
    public static User getUserInfo() {
        return [SELECT FirstName, LastName, Email FROM User WHERE Id = :UserInfo.getUserId()];
    }
}