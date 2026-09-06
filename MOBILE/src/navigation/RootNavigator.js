import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { PortailProvider } from '../context/PortailContext';

import PortailScreen from '../screens/PortailScreen';
import AccueilScreen from '../screens/AccueilScreen';
import AccueilDirectScreen from '../screens/AccueilDirectScreen';
import RubriquesScreen from '../screens/RubriquesScreen';
import RubriqueArticlesScreen from '../screens/RubriqueArticlesScreen';
import KiosqueScreen from '../screens/KiosqueScreen';
import VeriteOuIntoxScreen from '../screens/VeriteOuIntoxScreen';
import ProfilScreen from '../screens/ProfilScreen';
import ArticleScreen from '../screens/ArticleScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import AbonnementScreen from '../screens/AbonnementScreen';
import MesTelechargementsScreen from '../screens/MesTelechargementsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const ICONES = {
  Accueil: 'home',
  Rubriques: 'grid',
  Kiosque: 'newspaper',
  'Hors connexion': 'cloud-download',
  Direct: 'radio',
  'Vérité ou Intox': 'shield-checkmark',
  Profil: 'person-circle',
};

function barre(accent) {
  return ({ route }) => ({
    headerShown: false,
    tabBarActiveTintColor: accent,
    tabBarInactiveTintColor: colors.muted,
    tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
    tabBarIcon: ({ color, size }) => <Ionicons name={ICONES[route.name]} size={size - 2} color={color} />,
  });
}

// Le Quotidien — le journal papier : la Une, les rubriques traditionnelles,
// le kiosque et les numéros téléchargés. Vérité ou Intox n'y figure pas,
// c'est un format de la rédaction web (cf. Info en direct).
function OngletsQuotidien() {
  return (
    <PortailProvider value={{ portail: 'QUOTIDIEN' }}>
      <Tab.Navigator screenOptions={barre(colors.navy)}>
        <Tab.Screen name="Accueil" component={AccueilScreen} />
        <Tab.Screen name="Rubriques" component={RubriquesScreen} />
        <Tab.Screen name="Kiosque" component={KiosqueScreen} />
        <Tab.Screen name="Hors connexion" component={MesTelechargementsScreen} />
        <Tab.Screen name="Profil" component={ProfilScreen} />
      </Tab.Navigator>
    </PortailProvider>
  );
}

// Info en direct — la rédaction web : fil continu, formats courts et le
// service de vérification des rumeurs.
function OngletsDirect() {
  return (
    <PortailProvider value={{ portail: 'INFO_DIRECT' }}>
      <Tab.Navigator screenOptions={barre('#4FB3F0')}>
        <Tab.Screen name="Direct" component={AccueilDirectScreen} />
        <Tab.Screen name="Rubriques" component={RubriquesScreen} />
        <Tab.Screen name="Vérité ou Intox" component={VeriteOuIntoxScreen} />
        <Tab.Screen name="Profil" component={ProfilScreen} />
      </Tab.Navigator>
    </PortailProvider>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.ink, headerTitleStyle: { fontWeight: '700' } }}>
      <Stack.Screen name="Portail" component={PortailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Quotidien" component={OngletsQuotidien} options={{ headerShown: false }} />
      <Stack.Screen name="InfoDirect" component={OngletsDirect} options={{ headerShown: false }} />
      <Stack.Screen name="RubriqueArticles" component={RubriqueArticlesScreen} options={{ title: '' }} />
      <Stack.Screen name="Article" component={ArticleScreen} options={{ title: '' }} />
      <Stack.Screen name="Connexion" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Inscription" component={RegisterScreen} options={{ title: 'Créer un compte' }} />
      <Stack.Screen name="Abonnement" component={AbonnementScreen} options={{ title: "S'abonner" }} />
    </Stack.Navigator>
  );
}
