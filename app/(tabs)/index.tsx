import React, { useCallback, useEffect, useState } from 'react';
import {StyleSheet, FlatList, TouchableOpacity, Text, useWindowDimensions, View, ActivityIndicator} from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {fetchChangeStatus, fetchCreateOrder, fetchPayOrder, fetchProducts} from "@/service/api";
import {Product} from "@/models/Product";
import Toast from "react-native-root-toast";

import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useOrientation} from "@/hooks/useOrientation";

export default function PosScreen() {
  const [loading, setLoading] = useState<boolean>(true);
  const [basket, setBasket] = useState<Array<Product>>([]);
  const [products, setProducts] = useState<Array<Product>>([]);
  const [orderId, setOrderId] = useState<string | null>(null);

  const {  height } = useWindowDimensions();

  const { top: safeTopArea, left: safeLeftArea } = useSafeAreaInsets();
  const {isLandscape} = useOrientation();

  const getProducts = async () => {
    try{
      const productsFetched = await fetchProducts();
      if(productsFetched) {
        setProducts(productsFetched)
      }
    } finally {
      setLoading(false);
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
        position: height - 150,
      });
    }
  }

  const payOrder = useCallback( async() => {
    const payment = {
      order_id: orderId,
      amount: basket.reduce((acc, item) => acc + item.price_unit, 0)
    };
    const tempBasket = basket;
    const tempOrderId = orderId;
    setBasket([]);
    setOrderId(null);
    try {
      const response = await fetchPayOrder(payment);
      if (response && response.status !== 'completed' && orderId) {
        const status = {status: 'completed'}
        await fetchChangeStatus(orderId, status);
      }
      Toast.show('Order payed', {
        duration: Toast.durations.LONG,
        position: height - 150,
      });
    } catch (error) {
      // Restore saved state
      setBasket(tempBasket);
      setOrderId(tempOrderId);
    }
  }, [orderId, basket]);

  return (
    <ThemedView style={[{marginTop: safeTopArea}, styles.container, isLandscape && { marginLeft: safeLeftArea}]}>
      <ThemedView style={styles.productGrid}>
        {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#aaa" />
            </View>
        ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          numColumns={2}
        />
            )}
      </ThemedView>

      <ThemedView style={styles.basket}>
        <ThemedText type="title" style={styles.text}>Basket</ThemedText>

        {basket.map((item: Product, index) => (
          <ThemedView key={index} style={styles.basketItem}>
            <Text style={styles.textBasket}>{item.name}</Text>
            <Text style={styles.textBasket}>${item.price_unit}</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  textBasket: {
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
