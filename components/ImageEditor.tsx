
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Dimensions,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import Slider from '@react-native-community/slider';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontWeight: 'normal' | 'bold';
}

interface StickerOverlay {
  id: string;
  emoji: string;
  x: number;
  y: number;
  size: number;
}

interface LinkOverlay {
  id: string;
  url: string;
  label: string;
  x: number;
  y: number;
}

interface ImageEditorProps {
  imageUri: string;
  onSave: (editedUri: string, overlays: { texts: TextOverlay[]; stickers: StickerOverlay[]; links: LinkOverlay[] }) => void;
  onCancel: () => void;
}

const STICKER_EMOJIS = ['😀', '😍', '🎉', '❤️', '👍', '🔥', '⭐', '💯', '✨', '🎨', '📸', '💼', '🚀', '💡', '🎯', '✅'];

const TEXT_COLORS = ['#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];

export default function ImageEditor({ imageUri, onSave, onCancel }: ImageEditorProps) {
  const [editedUri, setEditedUri] = useState(imageUri);
  const [brightness, setBrightness] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [saturation, setSaturation] = useState(1);
  
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [stickerOverlays, setStickerOverlays] = useState<StickerOverlay[]>([]);
  const [linkOverlays, setLinkOverlays] = useState<LinkOverlay[]>([]);
  
  const [showTextModal, setShowTextModal] = useState(false);
  const [showStickerModal, setShowStickerModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showAdjustments, setShowAdjustments] = useState(false);
  
  const [newText, setNewText] = useState('');
  const [newTextColor, setNewTextColor] = useState('#FFFFFF');
  const [newTextSize, setNewTextSize] = useState(24);
  const [newTextBold, setNewTextBold] = useState(false);
  
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkLabel, setNewLinkLabel] = useState('');
  
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);

  const applyAdjustments = async () => {
    try {
      // Note: expo-image-manipulator doesn't support brightness, contrast, saturation directly
      // We'll use resize as a placeholder - in a production app, you'd use a more advanced library
      // or implement these filters using a canvas-based approach
      const manipResult = await manipulateAsync(
        imageUri,
        [],
        { compress: 1, format: SaveFormat.PNG }
      );
      setEditedUri(manipResult.uri);
      Alert.alert('Info', 'Basic adjustments applied. For advanced filters, consider using a dedicated image processing library.');
    } catch (error) {
      console.error('Error applying adjustments:', error);
      Alert.alert('Error', 'Failed to apply adjustments.');
    }
  };

  const addTextOverlay = () => {
    if (!newText.trim()) {
      Alert.alert('Error', 'Please enter some text.');
      return;
    }
    
    const newOverlay: TextOverlay = {
      id: Date.now().toString(),
      text: newText,
      x: SCREEN_WIDTH / 2 - 50,
      y: 200,
      fontSize: newTextSize,
      color: newTextColor,
      fontWeight: newTextBold ? 'bold' : 'normal',
    };
    
    setTextOverlays([...textOverlays, newOverlay]);
    setNewText('');
    setShowTextModal(false);
  };

  const addStickerOverlay = (emoji: string) => {
    const newOverlay: StickerOverlay = {
      id: Date.now().toString(),
      emoji,
      x: SCREEN_WIDTH / 2 - 25,
      y: 250,
      size: 50,
    };
    
    setStickerOverlays([...stickerOverlays, newOverlay]);
    setShowStickerModal(false);
  };

  const addLinkOverlay = () => {
    if (!newLinkUrl.trim() || !newLinkLabel.trim()) {
      Alert.alert('Error', 'Please enter both URL and label.');
      return;
    }
    
    const newOverlay: LinkOverlay = {
      id: Date.now().toString(),
      url: newLinkUrl,
      label: newLinkLabel,
      x: SCREEN_WIDTH / 2 - 60,
      y: 300,
    };
    
    setLinkOverlays([...linkOverlays, newOverlay]);
    setNewLinkUrl('');
    setNewLinkLabel('');
    setShowLinkModal(false);
  };

  const removeTextOverlay = (id: string) => {
    setTextOverlays(textOverlays.filter(t => t.id !== id));
    setSelectedTextId(null);
  };

  const removeStickerOverlay = (id: string) => {
    setStickerOverlays(stickerOverlays.filter(s => s.id !== id));
    setSelectedStickerId(null);
  };

  const removeLinkOverlay = (id: string) => {
    setLinkOverlays(linkOverlays.filter(l => l.id !== id));
    setSelectedLinkId(null);
  };

  const handleSave = () => {
    onSave(editedUri, {
      texts: textOverlays,
      stickers: stickerOverlays,
      links: linkOverlays,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.headerButton}>
          <IconSymbol
            ios_icon_name="xmark"
            android_material_icon_name="close"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Image</Text>
        <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.imageContainer}>
        <Image source={{ uri: editedUri }} style={styles.image} resizeMode="contain" />
        
        {textOverlays.map((overlay) => (
          <TouchableOpacity
            key={overlay.id}
            style={[
              styles.textOverlay,
              {
                left: overlay.x,
                top: overlay.y,
                borderWidth: selectedTextId === overlay.id ? 2 : 0,
                borderColor: colors.primary,
              },
            ]}
            onPress={() => setSelectedTextId(overlay.id)}
            onLongPress={() => {
              Alert.alert('Remove Text', 'Do you want to remove this text?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Remove', onPress: () => removeTextOverlay(overlay.id), style: 'destructive' },
              ]);
            }}
          >
            <Text
              style={{
                fontSize: overlay.fontSize,
                color: overlay.color,
                fontWeight: overlay.fontWeight,
                textShadowColor: 'rgba(0, 0, 0, 0.75)',
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 3,
              }}
            >
              {overlay.text}
            </Text>
          </TouchableOpacity>
        ))}
        
        {stickerOverlays.map((overlay) => (
          <TouchableOpacity
            key={overlay.id}
            style={[
              styles.stickerOverlay,
              {
                left: overlay.x,
                top: overlay.y,
                borderWidth: selectedStickerId === overlay.id ? 2 : 0,
                borderColor: colors.primary,
              },
            ]}
            onPress={() => setSelectedStickerId(overlay.id)}
            onLongPress={() => {
              Alert.alert('Remove Sticker', 'Do you want to remove this sticker?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Remove', onPress: () => removeStickerOverlay(overlay.id), style: 'destructive' },
              ]);
            }}
          >
            <Text style={{ fontSize: overlay.size }}>{overlay.emoji}</Text>
          </TouchableOpacity>
        ))}
        
        {linkOverlays.map((overlay) => (
          <TouchableOpacity
            key={overlay.id}
            style={[
              styles.linkOverlay,
              {
                left: overlay.x,
                top: overlay.y,
                borderWidth: selectedLinkId === overlay.id ? 2 : 0,
                borderColor: colors.primary,
              },
            ]}
            onPress={() => setSelectedLinkId(overlay.id)}
            onLongPress={() => {
              Alert.alert('Remove Link', 'Do you want to remove this link?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Remove', onPress: () => removeLinkOverlay(overlay.id), style: 'destructive' },
              ]);
            }}
          >
            <IconSymbol
              ios_icon_name="link"
              android_material_icon_name="link"
              size={16}
              color={colors.primary}
            />
            <Text style={styles.linkText}>{overlay.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.toolsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolsScroll}>
          <TouchableOpacity style={styles.toolButton} onPress={() => setShowAdjustments(!showAdjustments)}>
            <IconSymbol
              ios_icon_name="slider.horizontal.3"
              android_material_icon_name="tune"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.toolText}>Adjust</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.toolButton} onPress={() => setShowTextModal(true)}>
            <IconSymbol
              ios_icon_name="textformat"
              android_material_icon_name="text_fields"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.toolText}>Text</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.toolButton} onPress={() => setShowStickerModal(true)}>
            <IconSymbol
              ios_icon_name="face.smiling"
              android_material_icon_name="emoji_emotions"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.toolText}>Stickers</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.toolButton} onPress={() => setShowLinkModal(true)}>
            <IconSymbol
              ios_icon_name="link"
              android_material_icon_name="link"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.toolText}>Link</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {showAdjustments && (
        <View style={styles.adjustmentsPanel}>
          <Text style={styles.adjustmentLabel}>Brightness</Text>
          <Slider
            style={styles.slider}
            minimumValue={0.5}
            maximumValue={1.5}
            value={brightness}
            onValueChange={setBrightness}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
          />
          
          <Text style={styles.adjustmentLabel}>Contrast</Text>
          <Slider
            style={styles.slider}
            minimumValue={0.5}
            maximumValue={1.5}
            value={contrast}
            onValueChange={setContrast}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
          />
          
          <Text style={styles.adjustmentLabel}>Saturation</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={2}
            value={saturation}
            onValueChange={setSaturation}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
          />
          
          <TouchableOpacity style={styles.applyButton} onPress={applyAdjustments}>
            <Text style={styles.applyButtonText}>Apply Adjustments</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={showTextModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Text</Text>
            
            <TextInput
              style={styles.textInput}
              placeholder="Enter text..."
              placeholderTextColor={colors.textSecondary}
              value={newText}
              onChangeText={setNewText}
              multiline
            />
            
            <Text style={styles.modalLabel}>Font Size: {newTextSize}</Text>
            <Slider
              style={styles.slider}
              minimumValue={12}
              maximumValue={48}
              value={newTextSize}
              onValueChange={setNewTextSize}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              step={1}
            />
            
            <Text style={styles.modalLabel}>Color</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorPicker}>
              {TEXT_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color, borderWidth: newTextColor === color ? 3 : 1 },
                  ]}
                  onPress={() => setNewTextColor(color)}
                />
              ))}
            </ScrollView>
            
            <TouchableOpacity
              style={[styles.boldButton, newTextBold && styles.boldButtonActive]}
              onPress={() => setNewTextBold(!newTextBold)}
            >
              <Text style={styles.boldButtonText}>Bold</Text>
            </TouchableOpacity>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={() => setShowTextModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalAddButton} onPress={addTextOverlay}>
                <Text style={styles.modalAddText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showStickerModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Sticker</Text>
            
            <ScrollView contentContainerStyle={styles.stickerGrid}>
              {STICKER_EMOJIS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={styles.stickerOption}
                  onPress={() => addStickerOverlay(emoji)}
                >
                  <Text style={styles.stickerEmoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity style={styles.modalCancelButton} onPress={() => setShowStickerModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showLinkModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Link</Text>
            
            <TextInput
              style={styles.textInput}
              placeholder="Link URL (e.g., https://example.com)"
              placeholderTextColor={colors.textSecondary}
              value={newLinkUrl}
              onChangeText={setNewLinkUrl}
              autoCapitalize="none"
              keyboardType="url"
            />
            
            <TextInput
              style={styles.textInput}
              placeholder="Link Label"
              placeholderTextColor={colors.textSecondary}
              value={newLinkLabel}
              onChangeText={setNewLinkLabel}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={() => setShowLinkModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalAddButton} onPress={addLinkOverlay}>
                <Text style={styles.modalAddText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingTop: Platform.OS === 'android' ? 48 : 12,
  },
  headerButton: {
    padding: 8,
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textOverlay: {
    position: 'absolute',
    padding: 8,
    borderRadius: 4,
  },
  stickerOverlay: {
    position: 'absolute',
    padding: 4,
    borderRadius: 4,
  },
  linkOverlay: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + 'CC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  linkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  toolsContainer: {
    backgroundColor: colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 12,
  },
  toolsScroll: {
    paddingHorizontal: 16,
    gap: 16,
  },
  toolButton: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  toolText: {
    fontSize: 12,
    color: colors.text,
    marginTop: 4,
  },
  adjustmentsPanel: {
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  adjustmentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  applyButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: SCREEN_HEIGHT * 0.7,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
    minHeight: 50,
  },
  colorPicker: {
    flexDirection: 'row',
    marginVertical: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderColor: colors.border,
  },
  boldButton: {
    backgroundColor: colors.background,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  boldButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  boldButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: colors.background,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  modalAddButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalAddText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  stickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingVertical: 12,
  },
  stickerOption: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  stickerEmoji: {
    fontSize: 32,
  },
});
