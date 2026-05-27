import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';

interface PaginationProps {
  page: number;
  totalPages: number;
  loading?: boolean;
  onPageChange: (newPage: number) => void;
}

/**
 * Gera a lista de itens a mostrar na paginação.
 * Exemplo com 15 páginas, página actual = 7:
 *   [1, '...', 5, 6, 7, 8, 9, '...', 15]
 */
function geratepages(page: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [1];
  const begin = Math.max(2, page - 2);
  const end    = Math.min(totalPages - 1, page + 2);

  if (begin > 2) pages.push('...');
  for (let i = begin; i <= end; i++) pages.push(i);
  if (end   < totalPages - 1) pages.push('...');
  pages.push(totalPages);

  return pages;
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  loading = false,
  onPageChange,
}) => {
  // Obtém as cores do tema actual (dark / light)
  const { colors, isDark } = useTheme();

  if (totalPages <= 1) return null;

  const pages         = geratepages(page, totalPages);
  const previousbtn      = page > 1 && !loading;
  const nextbtn          = page < totalPages && !loading;

  // Cores dinâmicas conforme o tema
  const btnBg         = isDark ? '#2a2a3d' : '#f3f0ff';
  const btnDisabledBg = isDark ? '#1e1e2a' : '#f5f5f5';
  const borderColor   = isDark ? '#3a3a55' : 'transparent';
  const containerBg   = isDark ? colors.background : 'transparent';
  const borderTop     = isDark ? '#2a2a3d' : '#e8e8f0';

  return (
    <View style={[styles.container, { backgroundColor: containerBg, borderTopColor: borderTop }]}>

      {/* Botão "Anterior" */}
      <TouchableOpacity
        style={[
          styles.navBtn,
          { backgroundColor: previousbtn ? btnBg : btnDisabledBg, borderColor },
        ]}
        onPress={() => onPageChange(page - 1)}
        disabled={!previousbtn}
        accessibilityLabel="Página anterior">
        <Icon
          name="chevron-left"
          size={20}
          color={previousbtn ? colors.accent : (isDark ? '#555' : '#ccc')}
        />
      </TouchableOpacity>

      {/* Números de página */}
      <View style={styles.pagesRow}>
        {pages.map((item, index) =>
          item === '...' ? (
            // Ellipsis — não clicável
            <View key={`ellipsis-${index}`} style={styles.ellipsis}>
              <Text style={[styles.ellipsisText, { color: isDark ? '#555' : '#9D86E1' }]}>
                …
              </Text>
            </View>
          ) : (
            // Número de página
            <TouchableOpacity
              key={item}
              style={[
                styles.pageBtn,
                {
                  backgroundColor: item === page ? colors.accent : btnBg,
                  borderColor:     item === page ? colors.accent : borderColor,
                },
              ]}
              onPress={() => item !== page && onPageChange(item)}
              disabled={loading || item === page}
              accessibilityLabel={`Página ${item}`}>

              {/* Spinner na página actual durante loading */}
              {item === page && loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text
                  style={[
                    styles.pageBtnText,
                    {
                      color: item === page
                        ? '#fff'
                        : (isDark ? '#aaa' : colors.accent),
                    },
                  ]}>
                  {item}
                </Text>
              )}
            </TouchableOpacity>
          )
        )}
      </View>

      {/* Botão "Próximo" */}
      <TouchableOpacity
        style={[
          styles.navBtn,
          { backgroundColor: nextbtn ? btnBg : btnDisabledBg, borderColor },
        ]}
        onPress={() => onPageChange(page + 1)}
        disabled={!nextbtn}
        accessibilityLabel="Próxima página">
        <Icon
          name="chevron-right"
          size={20}
          color={nextbtn ? colors.accent : (isDark ? '#555' : '#ccc')}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'center',
    paddingVertical:   14,
    paddingHorizontal: 8,
    borderTopWidth:    4,
    gap:               4,
    marginBottom:      100, // Espaço para o footer
  },
  navBtn: {
    width:            36,
    height:           36,
    borderRadius:     10,
    alignItems:       'center',
    justifyContent:   'center',
    marginHorizontal: 4,
    borderWidth:      1,
  },
  pagesRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
  },
  pageBtn: {
    minWidth:          34,
    height:            34,
    borderRadius:      8,
    alignItems:        'center',
    justifyContent:    'center',
    paddingHorizontal: 6,
    borderWidth:       1,
  },
  pageBtnText: {
    fontSize:   14,
    fontWeight: '600',
  },
  ellipsis: {
    width:          28,
    alignItems:     'center',
    justifyContent: 'center',
  },
  ellipsisText: {
    fontSize:      14,
    letterSpacing: 1,
  },
});

export default Pagination;