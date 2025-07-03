Global class DownloadOrderInvoice {
     private OrderSummary currentOrder;
     public List<OrderItemSummary> orderItems { get; set; }

     public DownloadOrderInvoice(ApexPages.StandardController controller) {
        this.currentOrder = (OrderSummary)controller.getRecord();
         
         orderItems = [SELECT id,Product2.name, Quantity, UnitPrice, TotalPrice
                      FROM OrderItemSummary
                      WHERE OrderSummaryId = :currentOrder.id and Product2.name !='FREE Shipping' and  Product2.name !='Shipping Charge Product'];
    }
 public List<OrderItemSummary> getOrderItems() {
        return orderItems;
    }
}