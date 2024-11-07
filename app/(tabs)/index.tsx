import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, Text } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {fetchChangeStatus, fetchCreateOrder, fetchPayOrder, fetchProducts} from "@/service/api";
import {Product} from "@/models/Product";
import Toast from "react-native-root-toast";
import {windowHeight} from "@/service/sendFetch";

export default function PosScreen() {
  const [basket, setBasket] = useState<Array<Product>>([]);
  const [products, setProducts] = useState<Array<Product>>([]);
  const [orderId, setOrderId] = useState<string | null>(null);

  const getProducts = async () => {
      const productsFetched = await fetchProducts();
      if(productsFetched) {
        setProducts(productsFetched)
      }
  }

  useEffect(() => {
    getProducts();
  }, [])

  const renderProduct = ({item}) => (
    <TouchableOpacity style={styles.product} onPress={() => setBasket((prev) => [...prev, item])}>
      <Text style={styles.text}>{item.name}</Text>
      <Text style={styles.text}>${item.price_unit * (item.vat_rate + 1)}</Text>
    </TouchableOpacity>
  );

  const createOrder = async () => {
    const totalOrder = { total: basket.reduce((acc, item) => acc + item.price_unit, 0), }
    const order = await fetchCreateOrder(totalOrder);
    if(order) {
      setOrderId(order.id);
      Toast.show('Order created', {
        duration: Toast.durations.LONG,
        position: windowHeight - 150,
      });
    }
  }

  const payOrder = useCallback( async() => {
    const payment = {
      order_id: orderId,
      amount: basket.reduce((acc, item) => acc + item.price_unit, 0)
    };

    const response = await fetchPayOrder(payment);

    if(response && response.status !== 'completed' && orderId) {
        const status = {status: 'completed'}
        await fetchChangeStatus(orderId, status);

    }
    Toast.show('Order payed', {
      duration: Toast.durations.LONG,
      position: windowHeight - 150,
    });
    setBasket([]);
    setOrderId(null);
  }, [orderId, basket]);

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.productGrid}>
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          numColumns={2}
        />
      </ThemedView>

      <ThemedView style={styles.basket}>
        <ThemedText type="title" style={styles.text}>Basket</ThemedText>

        {basket.map((item: Product, index) => (
          <ThemedView key={index} style={styles.basketItem}>
            <Text style={styles.text}>{item.name}</Text>
            <Text style={styles.text}>${item.price_unit}</Text>
          </ThemedView>
        ))}

        <ThemedText style={styles.text}>Total: ${basket.reduce((acc, item) => acc + item.price_unit, 0)}</ThemedText>

        <TouchableOpacity style={styles.button} onPress={createOrder}>
          <ThemedText style={styles.buttonText}>Create Order</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, !orderId && { backgroundColor: '#555' }]}
          onPress={payOrder}
          disabled={!orderId}
        >
          <ThemedText style={styles.buttonText}>Pay</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  productGrid: {
    flex: 2,
    padding: 10,
  },
  product: {
    flex: 1,
    margin: 10,
    padding: 10,
    backgroundColor: '#1e1e1e',
    alignItems: 'center',
  },
  basket: {
    flex: 1,
    padding: 10,
    backgroundColor: '#1e1e1e',
  },
  basketItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
    padding: 5,
  },
  text: {
    color: '#ffffff',
  },
  button: {
    backgroundColor: '#173829',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
