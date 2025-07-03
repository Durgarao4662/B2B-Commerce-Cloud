public class GetRecommendationProducts {
    @AuraEnabled(cacheable=true)
    public static list<ConnectApi.ProductDetail> getRecommendation(
        String communityId,
        String productId,
        String effectiveAccountId
    ){
        if(productId != null){
            //list<ProductCategoryProduct> catList = [select ProductCategoryId, ProductId from ProductCategoryProduct where ProductId =: productId];
            list<Product_Recommendation__c> recList = [select Recommendation__c from Product_Recommendation__c where Parent_Product__c =:productId];
           // set<id> catIdset = new set<id>();
          // set<Product_Recommendation__c> catIdset = new set<Product_Recommendation__c>();
           // set<id> catIdset = new set<id>();
            // for(Product_Recommendation__c pcp: recList){
            //     catIdset.add(pcp.Recommendation__c);
            // }
          //  System.debug('Recommendation List:: '+catIdset);
            list<ConnectApi.ProductDetail> prodData = new list<ConnectApi.ProductDetail>();
            for(Product_Recommendation__c prod: recList){
                prodData.add(B2BGetInfo.getProduct(communityId, prod.Recommendation__c, effectiveAccountId));
            }

            return prodData;
        }
        return null;
    }
}