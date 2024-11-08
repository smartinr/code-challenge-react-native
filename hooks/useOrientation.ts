import {useWindowDimensions} from "react-native";

const useOrientation = () => {
    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;

    return {
        isLandscape
    };
}

export { useOrientation }
