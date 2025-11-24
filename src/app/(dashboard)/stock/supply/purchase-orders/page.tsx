'use client';

import { usePurchaseOrders } from '@/hooks/stock/use-stock-other';

export default function PurchaseOrdersPage() {
  const { data: purchaseOrdersResponse } = usePurchaseOrders();
  const purchaseOrders = purchaseOrdersResponse?.purchaseOrders || [];

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total de Pedidos
              </p>
              <p className="text-2xl font-bold">{purchaseOrders.length}</p>
            </div>
            <span className="text-2xl">📋</span>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Pendentes
              </p>
              <p className="text-2xl font-bold">
                {purchaseOrders.filter(o => o.status === 'PENDING').length}
              </p>
            </div>
            <span className="text-2xl">⏳</span>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Confirmados
              </p>
              <p className="text-2xl font-bold">
                {purchaseOrders.filter(o => o.status === 'CONFIRMED').length}
              </p>
            </div>
            <span className="text-2xl">✅</span>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Recebidos
              </p>
              <p className="text-2xl font-bold">
                {purchaseOrders.filter(o => o.status === 'RECEIVED').length}
              </p>
            </div>
            <span className="text-2xl">📦</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => console.log('Create purchase order')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Novo Pedido
        </button>
        <button
          onClick={() => console.log('Import purchase orders')}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Importar
        </button>
      </div>

      {/* Simple list for now */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border">
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">Pedidos de Compra</h3>
          {purchaseOrders.length === 0 ? (
            <p className="text-gray-500">Nenhum pedido de compra encontrado</p>
          ) : (
            <div className="space-y-2">
              {purchaseOrders.map(order => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 border rounded"
                >
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-sm text-gray-600">
                      Fornecedor: {order.supplierId}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      R$ {order.totalPrice.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
