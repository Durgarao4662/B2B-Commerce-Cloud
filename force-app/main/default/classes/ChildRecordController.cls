// ChildRecordController.cls
public with sharing class ChildRecordController {
    @AuraEnabled(cacheable=true)
    public static List<Product2> getChildRecords(Id parentId) {
        //System.debug('logLevel '+ recProductIds);
        System.debug('Id '+parentId);
        //List<Product_Recommendation__c> recProductIds = [select Recommendation__c from Product_Recommendation__c where Parent_Product__c=:parentId];
       // Id pId = '01tGC00000F7b8eYAB';
        // Query child records related to the parent record
        Set<Id> childIds = new Set<Id>();
        List<Product_Recommendation__c> recProductIds = [select Recommendation__c from Product_Recommendation__c where Parent_Product__c=:parentId];
        for(Product_Recommendation__c pRec: recProductIds){
            childIds.add(pRec.Recommendation__c);
        }
        return [SELECT Id, Name FROM Product2 WHERE Id != :parentId and Id !=: childIds];
    }

    @AuraEnabled(cacheable=true)
    public static List<Product_Recommendation__c> getRecommendations(Id parentId) {
       // Id pId = '01tGC00000F7b8eYAB';
        // Query child records related to the parent record
        //List<Product_Recommendation__c> recProductIds = [select Recommendation__c from Product_Recommendation__c where Parent_Product__c=:parentId];
        return [SELECT Recommendation__c, Recommendation__r.Name from Product_Recommendation__c where Parent_Product__c=:parentId];
    }

    @AuraEnabled
    public static void assignChildRecordsToParent(List<Id> childRecordIds, Id parentId) {
        // Assign selected child records to the parent record
        List<Product_Recommendation__c> childRecordsToUpdate = new List<Product_Recommendation__c>();
       // for (Product_Recommendation__c childRecordId : childRecordIds) {
            // childRecordsToUpdate.add(new Product_Recommendation__c(
            //     Parent_Product__c = parentId,
            //     Recommendation__c = childRecordIds
            // ));'
        for(Id childRecordId:childRecordIds){
            
            Product_Recommendation__c prObj = new Product_Recommendation__c();
            prObj.Parent_Product__c = parentId;
            prObj.Recommendation__c = childRecordId;
            childRecordsToUpdate.add(prObj);
        }
       // }
        insert childRecordsToUpdate;
    }
    @AuraEnabled
    public static void deleteRecommendation(Id recordId) {
        // Assign selected child records to the parent record
       // List<Product_Recommendation__c> childRecordsToUpdate = new List<Product_Recommendation__c>();
       List<Product_Recommendation__c> childRecordToDelete =[select Id from Product_Recommendation__c where Id=:recordId];
       if(!childRecordToDelete.isEmpty()){
        delete childRecordToDelete;
       }
       // }
        
    }
}