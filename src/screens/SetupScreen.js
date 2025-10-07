import React, { useState } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
const SetupScreen = ({navigation}) => {
    const [inputValue, setInputValue] = useState('');
    const [unit, setUnit] = useState('YIL');

    const calculateKaza = () => {
        const value = parseInt(inputValue, 10);
        if(isNaN(value) || value <= 0) {
            Alert.alert("Hata", "Lütfen geçerli bir sayı giriniz.");
            return;
        }


        const VAKIT_SAYISI = 5
        let totalDays;

        if (unit === 'YIL') {
            totalDays = value * 365
        } else {totalDays = value

        }

        const totalKaza = totalDays * VAKIT_SAYISI;
        const kazaPerVakit = Math.floor(totalKaza/VAKIT_SAYISI)

        const initialKazaState = {
            Sabah : kazaPerVakit,
            Öğle : kazaPerVakit,
            İkindi : kazaPerVakit,
            Akşam : kazaPerVakit,
            Yatsı : kazaPerVakit,
            total : totalKaza
        };

        navigation.navigate('Tracker', {initialKazaState})
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Kazalarım</Text>
            <Text style={styles.description}>Kaza borcunuzun süresini yıl veya gün olarak giriniz.</Text>


            <TextInput
            style={styles.input}
            placeholder='Süreyi Girin'
            keyboardType='numeric'
            value={inputValue}
            onChangeText={setInputValue}
            />

            <View style={styles.toggleContainer}>
                <TouchableOpacity style={[styles.toggleButton, unit === 'YIL' && styles.toggleButtonActive]}
                onPress={() => setUnit('YIL')} 
                >
                  <Text style={[styles.toggleText, unit === 'YIL' && styles.toggleTextActive]}>YIL</Text>  
                </TouchableOpacity>

                 <TouchableOpacity style={[styles.toggleButton, unit === 'GÜN' && styles.toggleButtonActive]}
                onPress={() => setUnit('GÜN')} 
                >
                  <Text style={[styles.toggleText, unit === 'GÜN' && styles.toggleTextActive]}>GÜN</Text>  
                </TouchableOpacity>
            </View>

            <TouchableOpacity 
            style={styles.calculateButton}
            onPress={calculateKaza}>
                <Text style={styles.calculateButtonText}>Hesapla ve Başla</Text>
            </TouchableOpacity>

        </SafeAreaView>
    )

}


 

const styles = StyleSheet.create({
    container: {
        flex:1,
        backgroundColor:'#f5f5f5',
        alignItems:'center',
        padding: 20
    },
    header:{
        fontSize: 32,
        fontWeight: 'bold',
        color: '#337765',
        marginTop:40,
        marginBottom:10
    },
    description:{
        fontSize:16,
        color:'#666',
        textAlign:'center',
        marginBottom:30
    },
    input:{
        width: '80%',
        height:60,
        backgroundColor: 'White',
        borderRadius:10,
        paddingHorizontal:20,
        fontSize:24,
        textAlign:'center',
        marginBottom:20,
        borderWidth:1,
        borderColor:'#ddd',
    },
    toggleContainer:{
        flexDirection:'row',
        backgroundColor:'white',
        borderRadius:10,
        marginBottom:40,
        overflow:'hidden',
        borderWidth:1,
        borderColor:'#307765',
    },
    toggleButton:{
        paddingVertical:15,
        paddingHorizontal:30,
        minWidth:120,
    },
    toggleButtonActive:{
        backgroundColor:'#307765',
        
    },
    toggleText:{
        fontSize:16,
        fontWeight:600,
        color:'#307765'
    },
    toggleTextActive:{
        color:'white'
    },
    calculateButton:{
        width:'80%',
        backgroundColor:'#5cb85c',
        padding:18,
        borderRadius:10,
        elevation:3,
        shadowColor:'#000',
        shadowOpacity:0.25,
        shadowRadius:3.84
    },
    calculateButtonText:{
        color:'white',
        fontSize:18,
        fontWeight:'bold',
        textAlign:'center'
    }
})

export default SetupScreen;