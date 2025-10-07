import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute } from "@react-navigation/native";
import React, {useState, useEffect} from "react";
import {View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context";

const KAZA_DATA_KEY = 'kazaData';
const TrackerScreen = ({ navigation }) => {
    const route = useRoute();

    const [kazaCounts, setKazaCounts] = useState({});
    const [totalKaza, setTotalKaza] = useState(0);

    const vakitler = ['Sabah','Öğle','İkindi','Akşam','Yatsı'];

    useEffect(() => {
        loadKazaData();
    }, []);

    const loadKazaData = async ()=> {
        try {
            const storedData = await AsyncStorage.getItem(KAZA_DATA_KEY);

            if (storedData) {
                const parsedData =JSON.parse(storedData);
                setKazaCounts(parsedData);

                setTotalKaza(calculateTotal(parsedData))
            } else if (route.params?.initialKazaState) {
                const initialData = route.params.initialKazaState
                await AsyncStorage.setItem(KAZA_DATA_KEY, JSON.stringify(initialData));
                setKazaCounts(initialData)
                setTotalKaza(initialData.total)
            } else {
                Alert.alert("Hata", "Kaza verisi bulunamadı. Lütfen tekrar hesaplayınız.")
            }
        } catch (e) {
            console.error("Veri yüklenirken hata oluştu: ",e);
        }
    };

    const saveKazaData = async (data) => {
        try {
            await AsyncStorage.setItem(KAZA_DATA_KEY, JSON.stringify(data));
        } catch (e) {
            console.error("Veri kaydedilirken hata oluştu: ", e);
        }
    };

    const calculateTotal = (counts) => {
        return vakitler.reduce((sum, vakit) => sum + (counts[vakit] || 0), 0);
    };
   // *** KAZA KLIDIM FONKSİYONU (GÜNCELLENMİŞ) ***
  const kazaKildim = (vakit) => {
    const newKazaCounts = { ...kazaCounts }; 
    
    if (newKazaCounts[vakit] && newKazaCounts[vakit] > 0) {
      newKazaCounts[vakit] -= 1; 

      const newTotal = calculateTotal(newKazaCounts);
      
      // 1. OTOMATİK SIFIRLAMA KONTROLÜ
      if (newTotal === 0) {
        setTotalKaza(0);
        setKazaCounts({}); // State'i hemen temizle
        saveKazaData({}); // Async'e boş obje kaydet (veya sıfırla)
        
        // Tebrikler mesajı göster ve ardından sıfırla fonksiyonunu çağır.
        Alert.alert("Mükemmel!", "Tüm kaza namazı borcunuzu tamamladınız! Allah kabul etsin.");
        // Gecikmeli sıfırlama (Alert'in kapanmasını beklemek için)
        setTimeout(() => {
            resetKazaData();
        }, 1000); 
        return; // İşlemi sonlandır
      }

      // 2. Normal Durum: Borç bitmediyse state ve kaydı güncelle
      setKazaCounts(newKazaCounts);
      setTotalKaza(newTotal);
      saveKazaData(newKazaCounts);
      
    } else {
      Alert.alert("Tebrikler!", `${vakit} namazı için kaza borcunuz kalmadı.`);
    }
  };
    const resetKazaData = async () => {
    try {
      // 1. AsyncStorage'daki kaydı sil
      await AsyncStorage.removeItem(KAZA_DATA_KEY);
      
      // 2. State'leri sıfırla
      setKazaCounts({});
      setTotalKaza(0);
      
      // 3. Kullanıcıyı Giriş Ekranına (SetupScreen) yönlendir.
      // Bu, navigasyon geçmişindeki mevcut ekranı silip yerine SetupScreen'i koyar.
      navigation.reset({
        index: 0,
        routes: [{ name: 'Setup' }],
      });
      
    } catch (e) {
      Alert.alert("Hata", "Sıfırlama işlemi başarısız oldu.");
      console.error("Veri sıfırlanırken hata oluştu:", e);
    }
  };

  // MANUEL SIFIRLAMA İÇİN ONAY İSTEME
  const handleReset = () => {
    Alert.alert(
      "Emin Misiniz?",
      "Tüm kaza borcunuzu sıfırlamak ve baştan başlamak istediğinize emin misiniz?",
      [
        {
          text: "İptal",
          style: "cancel"
        },
        { 
          text: "Evet, Sıfırla", 
          onPress: resetKazaData, 
          style: 'destructive' // iOS'ta kırmızı renkli uyarı butonu için
        }
      ],
      { cancelable: true }
    );
  };

    if (Object.keys(kazaCounts).length === 0 && !route.params?.initialKazaState) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Veriler Yükleniyor...</Text>
            </View>
        );
    }
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.mainHeader}>Kalan Kaza Borcunuz</Text>
                <Text style={styles.totalCount}>
                    {totalKaza.toLocaleString(`tr-TR`)}
                </Text>
                <Text style={styles.totalLabel}>TOPLAM NAMAZ</Text>
                
        
                {vakitler.map((vakit) => (
          // map fonksiyonu ile vakitler dizisi üzerindeki her öğe için bir buton oluşturuyoruz.
          // key prop'u, React'in liste öğelerini verimli bir şekilde yönetmesi için zorunludur.
          <TouchableOpacity 
            key={vakit} 
            style={styles.vakitButton}
            onPress={() => kazaKildim(vakit)} // Butona basıldığında kazaKildim fonksiyonunu çalıştır
          >
            <Text style={styles.vakitTitle}>{vakit} Namazı</Text>
            
            <View style={styles.vakitCountBox}>
              <Text style={styles.vakitCount}>
                {kazaCounts[vakit]?.toLocaleString('tr-TR') || 0}
              </Text>
            </View>
            
          </TouchableOpacity>
          
        ))}
                
                <Text style={styles.footerText}>
          Butona her bastığınızda 1 kaza namazı düşülecektir. Allah kabul etsin!
        </Text>
        <TouchableOpacity 
          style={styles.resetButton} 
          onPress={handleReset} // Onay fonksiyonunu çağır
        >
          <Text style={styles.resetButtonText}>
            Tüm Borçları Sıfırla ve Baştan Başla
          </Text>
        </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    )}
const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:'#f9f9f9',
    },
    scrollContent:{
        alignItems:'center',
        paddingVertical:30,
        paddingHorizontal:20,
    },
    mainHeader:{
        fontSize:20,
        color:'#444',
        marginBottom:5,
    },
    totalCount:{
        fontSize:50,
        fontWeight:900,
        color:'#307765', 
    },
    totalLabel:{
        fontSize:14,
        color:'#666',
        fontWeight:'bold',
        marginBottom:40,
    },
    vakitButton:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        width:'100%',
        backgroundColor:'white',
        padding:20,
        borderRadius:12,
        marginBottom:15,
        borderLeftWidth:6,
        borderLeftColor:'#307765',
        elevation:2,
        shadowColor:'#000',
        shadowOffset: {width:0,height:1},
        shadowOpacity:0.1,
        shadowRadius:3,
    },
    vakitTitle:{
        fontSize:18,
        fontWeight:600,
        color:'#333',
    },
    vakitCountBox:{
        backgroundColor:'#e6f7e6',
        paddingHorizontal:15,
        paddingVertical:5,
        borderRadius:8,
        minWidth:80,
        alignItems:'center',
    },
    vakitCount:{
        fontSize:20,
        fontWeight:'bold',
        color:'#307765',
    },
    footerText:{
        marginTop:20,
        fontSize:12,
        color:'#888',
        textAlign:'center',
    },
    loadingContainer:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'#f9f9f9'
    },
    loadingText:{
        fontSize:18,
        color:'#666',
    },
     resetButton: {
    marginTop: 40,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d9534f', // Kırmızı çerçeve
    backgroundColor: '#f2dede', // Çok açık kırmızı arka plan
    width: '100%',
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#d9534f', // Kırmızı metin
    fontSize: 16,
    fontWeight: 'bold',
  },
})

export default TrackerScreen;