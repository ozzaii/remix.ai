import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { colors, gradients } from '../../theme/colors';
import { globalStyles } from '../../theme/styles';

interface CreateBeatButtonProps {
  onPress: () => void;
}

const CreateBeatButton: React.FC<CreateBeatButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={gradients.purpleToBlue}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.icon}>🎵</Text>
          <Text style={styles.text}>Claude ile Müzik Yarat</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    marginHorizontal: 24,
    borderRadius: 16,
    height: 80,
    ...globalStyles.shadow,
  },
  gradient: {
    flex: 1,
    borderRadius: 16,
    padding: 2,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.deepBlack + '80',
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  text: {
    ...globalStyles.heading3,
    color: colors.textPrimary,
  },
});

export default CreateBeatButton;
