import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

import AccueilScreen from '../screens/AccueilScreen';
import RubriqueScreen from '../screens/RubriqueScreen';
import KiosqueScreen from '../screens/KiosqueScreen';
import VeriteOuIntoxScreen from '../screens/VeriteOuIntoxScreen';
import ProfilScreen from '../screens/ProfilScreen';
import ArticleScreen from '../screens/ArticleScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import AbonnementScreen from '../screens/AbonnementScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ICONS = {
  Accueil: 'home',
  Rubriques: 'grid',
  Kiosque: 'newspaper',
  'Vérité ou Intox': 'shield-checkmark',
  Profil: 'person-circle',
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.navy,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 10.5, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => <Ionicons name={TAB_ICONS[route.name]} size={size - 2} color={color} />,
      })}
    >
      <Tab.Screen name="Accueil" component={AccueilScreen} />
      <Tab.Screen name="Rubriques" component={RubriqueScreen} />
      <Tab.Screen name="Kiosque" component={KiosqueScreen} />
      <Tab.Screen name="Vérité ou Intox" component={VeriteOuIntoxScreen} />
      <Tab.Screen name="Profil" component={ProfilScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.ink, headerTitleStyle: { fontWeight: '700' } }}>
      <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
      <Stack.Screen name="Article" component={ArticleScreen} options={{ title: '' }} />
      <Stack.Screen name="Connexion" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Inscription" component={RegisterScreen} options={{ title: 'Créer un compte' }} />
      <Stack.Screen name="Abonnement" component={AbonnementScreen} options={{ title: "S'abonner" }} />
    </Stack.Navigator>
  );
}
