import React, { useEffect, useState } from 'react';
import {ActivityIndicator, FlatList, View} from 'react-native';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {fetchOrders} from "@/service/api";
import {Order} from "@/models/Order";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useOrientation} from "@/hooks/useOrientation";

export default function TabTwoScreen() {
    const [loading, setLoading] = useState<boolean>(true);
  const [orders, setOrders] = useState<Array<Order>>([]);

    const { top: safeTopArea, left: safeLeftArea } = useSafeAreaInsets();
    const {isLandscape} = useOrientation();

  useEffect(() => {
    getOrders();
  }, []);

  const getOrders = async () => {
      try{
      const ordersFetched = await fetchOrders();
      if(ordersFetched) {
          setOrders(ordersFetched);
      }
  } finally {
        setLoading(false);
    }
  };

  return (
    <ThemedView style={[{marginTop: safeTopArea}, styles.container, isLandscape && {marginLeft: safeLeftArea}]}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Paid Orders</ThemedText>
      </ThemedView>
        {loading ? (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#aaa" />
            </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) =>
            {
                const date = new Date(item.created_at);
                const day = date.getDate();
                const month = date.getMonth() + 1;
                const year = date.getFullYear();

                const formattedDate = `${day}/${month}/${year}`
                return (
                    <ThemedView style={styles.orderItem}>
                        <ThemedText type='subtitle'>Total: {item.amount_total}$</ThemedText>
                        <ThemedText type='defaultSemiBold'> ID: {item.id}</ThemedText>
                        <ThemedText> Date: {formattedDate}</ThemedText>
                    </ThemedView>
                )
            }}
          />
        )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});
