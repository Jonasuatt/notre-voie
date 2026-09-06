import { useRef, useState } from 'react';
import {
  View, Text, Image, Modal, TouchableOpacity, FlatList, ScrollView,
  StyleSheet, useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { formatDateRange } from '../utils/format';

// Lecteur du journal, page à page. Il affiche les pages en images plutôt que
// le PDF : elles sont déjà produites pour le site, s'affichent avec le rendu
// natif — donc zoomables au pincement et fluides — et ne dépendent d'aucun
// lecteur externe, que le téléphone du lecteur n'a pas toujours.
export default function LecteurJournal({ edition, pages, onFermer }) {
  const { width, height } = useWindowDimensions();
  const [courante, setCourante] = useState(0);
  const liste = useRef(null);

  if (!edition || !pages?.length) return null;

  const surDefilement = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    if (index !== courante) setCourante(index);
  };

  const allerA = (index) => {
    const cible = Math.max(0, Math.min(index, pages.length - 1));
    liste.current?.scrollToIndex({ index: cible, animated: true });
    setCourante(cible);
  };

  return (
    <Modal visible animationType="slide" onRequestClose={onFermer}>
      <View style={styles.page}>
        <View style={styles.barre}>
          <TouchableOpacity onPress={onFermer} hitSlop={12}>
            <Ionicons name="close" size={26} color="#fff" />
          </TouchableOpacity>
          <View>
            <Text style={styles.numero}>N°{edition.numero}</Text>
            <Text style={styles.date}>{formatDateRange(edition.dateParution, edition.dateFin)}</Text>
          </View>
          <View style={{ width: 26 }} />
        </View>

        <FlatList
          ref={liste}
          data={pages}
          keyExtractor={(p, i) => String(p.numeroPage ?? i)}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={surDefilement}
          getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
          renderItem={({ item }) => (
            // Chaque page est dans sa propre zone zoomable : on relâche le
            // zoom en changeant de page, comme on repose un journal à plat.
            <ScrollView
              style={{ width }}
              maximumZoomScale={4}
              minimumZoomScale={1}
              contentContainerStyle={styles.zone}
              showsVerticalScrollIndicator={false}
            >
              <Image
                source={{ uri: item.uri || item.imageUrl }}
                style={{ width, height: height * 0.8 }}
                resizeMode="contain"
              />
            </ScrollView>
          )}
        />

        <View style={styles.pied}>
          <TouchableOpacity onPress={() => allerA(courante - 1)} disabled={courante === 0} hitSlop={10}>
            <Ionicons name="chevron-back" size={22} color={courante === 0 ? 'rgba(255,255,255,0.25)' : '#fff'} />
          </TouchableOpacity>
          <Text style={styles.compteur}>
            Page {pages[courante]?.numeroPage ?? courante + 1} / {pages.length}
          </Text>
          <TouchableOpacity
            onPress={() => allerA(courante + 1)}
            disabled={courante === pages.length - 1}
            hitSlop={10}
          >
            <Ionicons
              name="chevron-forward"
              size={22}
              color={courante === pages.length - 1 ? 'rgba(255,255,255,0.25)' : '#fff'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#000' },
  barre: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 46, paddingBottom: 8 },
  numero: { color: '#fff', fontWeight: '800', fontSize: 15, textAlign: 'center' },
  date: { color: 'rgba(255,255,255,0.55)', fontSize: 11, textAlign: 'center' },
  zone: { alignItems: 'center', justifyContent: 'center' },
  pied: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 22, paddingVertical: 14, paddingBottom: 26, backgroundColor: 'rgba(7,39,66,0.95)' },
  compteur: { color: '#fff', fontSize: 12.5, fontWeight: '700', minWidth: 110, textAlign: 'center' },
});
