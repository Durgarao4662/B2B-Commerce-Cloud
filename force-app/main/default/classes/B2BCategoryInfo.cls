public with sharing class B2BCategoryInfo {
  @AuraEnabled(cacheable=true)
  public static ConnectApi.ProductCategoryDetail getProductCategory(
    String communityId,
    String productCategoryId,
    String effectiveAccountId
  ) {
    // Lookup the webstore ID associated  with the community
    String webstoreId = B2BUtils.resolveCommunityIdToWebstoreId(communityId);
    return ConnectApi.CommerceCatalog.getProductCategory(
      webstoreId,
      productCategoryId,
      effectiveAccountID,
      null,
      false,
      null,
      false
    );
  }
}