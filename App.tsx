import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Accelerometer, Gyroscope, ThreeAxisMeasurement } from 'expo-sensors';


export default function App() {

  const [a, setA] = useState<null | ThreeAxisMeasurement>(null);
  const [g, setG] = useState<null | ThreeAxisMeasurement>(null);
  const [max, setMax] = useState(0)
  const [timer, setTimer] = useState(0);
  const [timerId, setTimerId] = useState(0)
  const [drop, setDrop] = useState(false)
  const accelerometerSetting = async () => {
    if (await Accelerometer.isAvailableAsync()) {

      Accelerometer.addListener(accelerometerData => {
        setA(accelerometerData);
      });
      Accelerometer.setUpdateInterval(16);
    }
  }

  const gyroscopeSetting = async () => {
    if (await Gyroscope.isAvailableAsync()) {

      Gyroscope.addListener(data => {
        setG(data);
      });
      Gyroscope.setUpdateInterval(16);
    }
  }

  useEffect(() => {

    accelerometerSetting()
    gyroscopeSetting();
    return () => {
      Accelerometer.removeAllListeners();
      Gyroscope.removeAllListeners();
    }
  }, [])

  useEffect(() => {
    if (a && g) {

      const Arms = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
      const Grms = Math.sqrt(g.x * g.x + g.y * g.y + g.z * g.z) * 131;


      if (Grms > max) {
        setMax(Grms);
        console.log(Grms, g);
      }

      if (Arms > 2 && Grms > 200) {
        console.log(Arms, Grms)
        console.log('IMPACTO')
        setTimeout(() => {
          setTimer(5);
          setDrop(true);
          clearTimeout(timerId)
          const timerid = setTimeout(() => {
            setTimer(0);
          }, 5000);
          setTimerId(timerid)
        }, 300)
      }

    }
  }, [a, g]);

  useEffect(() => {
    if (timer > 0 && a && drop) {
      const angleX = (Math.atan(a.z / (a.x * a.x + a.y * a.y)) * 180) / Math.PI
      const angleZ = (Math.atan(a.x / (a.z * a.z + a.y * a.y)) * 180) / Math.PI
      console.log('Angulos ', angleX, angleZ);
      if (angleX > 70 || angleX < -70 || angleZ > 70 || angleZ < -70) {
        console.log("QUEDA")
      } else {
        setDrop(false);
      }

    } else if (timer == 0 && drop) {
      Alert.alert("Atenção", "Queda detectada");
      setDrop(false);
    }
  }, [timer, a])

  return (
    <View style={styles.container}>
      <Text>Drop Detection App</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
