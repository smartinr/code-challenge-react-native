import Toast from "react-native-root-toast";
import {Dimensions} from "react-native";

const AUTH_USER_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzbWFydGluckBnbWFpbC5jb20iLCJleHAiOjE3MzIyNzA5NTN9.9IscuCmNfiGa1pOFJNYdNdHti0FUuo1bGPyhSdXkBz0'; // use your own token

const SCREEN_HEIGHT = Dimensions.get('window').height ;

const sendFetch = async (url: string, method?: string, body?: object) => {
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            "x-auth-user": AUTH_USER_TOKEN,
        },
        method: method,
        body: JSON.stringify(body)
    });

    if(response.ok) {
        return  await response.json();
    }
    const errorMessage = `Request failed to send with error ${response.status}`;
    Toast.show(errorMessage, {
        duration: Toast.durations.LONG,
        position: SCREEN_HEIGHT - 150,
        backgroundColor: '#173829'
    });

    return Promise.reject(errorMessage);
};

export { sendFetch };
