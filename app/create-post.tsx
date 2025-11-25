
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, FlipType, SaveFormat } from 'expo-image-manipulator';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_SIZE = (SCREEN_WIDTH - 48) / 3;

interface MediaItem {
  uri: string;
  type: 'image' | 'video';
  width?: number;
  height?: number;
}

export default function CreatePostScreen() {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant permission to access your photos and videos.');
      return false;
    }
    return true;
  };

  const pickMedia = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsMultipleSelection: true,
        quality: 1,
        videoMaxDuration: 60,
      });

      if (!result.canceled && result.assets) {
        const newMedia: MediaItem[] = result.assets.map(asset => ({
          uri: asset.uri,
          type: asset.type || 'image',
          width: asset.width,
          height: asset.height,
        }));
        setMedia([...media, ...newMedia]);
      }
    } catch (error) {
      console.log('Error picking media:', error);
      Alert.alert('Error', 'Failed to pick media. Please try again.');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant permission to access your camera.');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 1,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets) {
        const newMedia: MediaItem = {
          uri: result.assets[0].uri,
          type: 'image',
          width: result.assets[0].width,
          height: result.assets[0].height,
        };
        setMedia([...media, newMedia]);
      }
    } catch (error) {
      console.log('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const removeMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
    if (selectedMediaIndex === index) {
      setSelectedMediaIndex(null);
    }
  };

  const editImage = (index: number) => {
    if (media[index].type === 'video') {
      Alert.alert('Video Editing', 'Video editing is not available yet. Only image editing is supported.');
      return;
    }
    setSelectedMediaIndex(index);
  };

  const rotateImage = async () => {
    if (selectedMediaIndex === null) return;

    try {
      const manipResult = await manipulateAsync(
        media[selectedMediaIndex].uri,
        [{ rotate: 90 }],
        { compress: 1, format: SaveFormat.PNG }
      );

      const updatedMedia = [...media];
      updatedMedia[selectedMediaIndex] = {
        ...updatedMedia[selectedMediaIndex],
        uri: manipResult.uri,
        width: manipResult.width,
        height: manipResult.height,
      };
      setMedia(updatedMedia);
    } catch (error) {
      console.log('Error rotating image:', error);
      Alert.alert('Error', 'Failed to rotate image. Please try again.');
    }
  };

  const flipImageHorizontal = async () => {
    if (selectedMediaIndex === null) return;

    try {
      const manipResult = await manipulateAsync(
        media[selectedMediaIndex].uri,
        [{ flip: FlipType.Horizontal }],
        { compress: 1, format: SaveFormat.PNG }
      );

      const updatedMedia = [...media];
      updatedMedia[selectedMediaIndex] = {
        ...updatedMedia[selectedMediaIndex],
        uri: manipResult.uri,
      };
      setMedia(updatedMedia);
    } catch (error) {
      console.log('Error flipping image:', error);
      Alert.alert('Error', 'Failed to flip image. Please try again.');
    }
  };

  const flipImageVertical = async () => {
    if (selectedMediaIndex === null) return;

    try {
      const manipResult = await manipulateAsync(
        media[selectedMediaIndex].uri,
        [{ flip: FlipType.Vertical }],
        { compress: 1, format: SaveFormat.PNG }
      );

      const updatedMedia = [...media];
      updatedMedia[selectedMediaIndex] = {
        ...updatedMedia[selectedMediaIndex],
        uri: manipResult.uri,
      };
      setMedia(updatedMedia);
    } catch (error) {
      console.log('Error flipping image:', error);
      Alert.alert('Error', 'Failed to flip image. Please try again.');
    }
  };

  const cropImage = async () => {
    if (selectedMediaIndex === null) return;

    const currentMedia = media[selectedMediaIndex];
    const width = currentMedia.width || 1000;
    const height = currentMedia.height || 1000;

    try {
      const manipResult = await manipulateAsync(
        currentMedia.uri,
        [
          {
            crop: {
              originX: width * 0.1,
              originY: height * 0.1,
              width: width * 0.8,
              height: height * 0.8,
            },
          },
        ],
        { compress: 1, format: SaveFormat.PNG }
      );

      const updatedMedia = [...media];
      updatedMedia[selectedMediaIndex] = {
        ...updatedMedia[selectedMediaIndex],
        uri: manipResult.uri,
        width: manipResult.width,
        height: manipResult.height,
      };
      setMedia(updatedMedia);
    } catch (error) {
      console.log('Error cropping image:', error);
      Alert.alert('Error', 'Failed to crop image. Please try again.');
    }
  };

  const handlePost = () => {
    if (!content.trim() && media.length === 0) {
      Alert.alert('Empty Post', 'Please add some content or media to your post.');
      return;
    }

    console.log('Creating post with content:', content);
    console.log('Media items:', media.length);
    
    Alert.alert('Success', 'Post created successfully!', [
      {
        text: 'OK',
        onPress: () => router.back(),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <IconSymbol
            ios_icon_name="xmark"
            android_material_icon_name="close"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity onPress={handlePost} style={styles.headerButton}>
          <Text style={styles.postButton}>Post</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TextInput
          style={styles.textInput}
          placeholder="What's happening in your business?"
          placeholderTextColor={colors.textSecondary}
          multiline
          value={content}
          onChangeText={setContent}
          maxLength={500}
        />

        {media.length > 0 && (
          <View style={styles.mediaContainer}>
            <View style={styles.mediaGrid}>
              {media.map((item, index) => (
                <View key={index} style={styles.mediaItem}>
                  <TouchableOpacity onPress={() => editImage(index)}>
                    <Image source={{ uri: item.uri }} style={styles.mediaImage} />
                    {item.type === 'video' && (
                      <View style={styles.videoOverlay}>
                        <IconSymbol
                          ios_icon_name="play.circle.fill"
                          android_material_icon_name="play_circle"
                          size={40}
                          color="white"
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeMedia(index)}
                  >
                    <IconSymbol
                      ios_icon_name="xmark.circle.fill"
                      android_material_icon_name="cancel"
                      size={24}
                      color={colors.error}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {selectedMediaIndex !== null && media[selectedMediaIndex].type === 'image' && (
          <View style={styles.editingTools}>
            <Text style={styles.editingTitle}>Edit Image</Text>
            <View style={styles.editingButtons}>
              <TouchableOpacity style={styles.editButton} onPress={rotateImage}>
                <IconSymbol
                  ios_icon_name="rotate.right"
                  android_material_icon_name="rotate_right"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.editButtonText}>Rotate</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.editButton} onPress={flipImageHorizontal}>
                <IconSymbol
                  ios_icon_name="arrow.left.and.right"
                  android_material_icon_name="flip"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.editButtonText}>Flip H</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.editButton} onPress={flipImageVertical}>
                <IconSymbol
                  ios_icon_name="arrow.up.and.down"
                  android_material_icon_name="flip"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.editButtonText}>Flip V</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.editButton} onPress={cropImage}>
                <IconSymbol
                  ios_icon_name="crop"
                  android_material_icon_name="crop"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.editButtonText}>Crop</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.doneEditingButton}
              onPress={() => setSelectedMediaIndex(null)}
            >
              <Text style={styles.doneEditingText}>Done Editing</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={pickMedia}>
            <IconSymbol
              ios_icon_name="photo.on.rectangle"
              android_material_icon_name="photo_library"
              size={28}
              color={colors.primary}
            />
            <Text style={styles.actionText}>Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
            <IconSymbol
              ios_icon_name="camera.fill"
              android_material_icon_name="camera_alt"
              size={28}
              color={colors.primary}
            />
            <Text style={styles.actionText}>Camera</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.characterCount}>{content.length}/500</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? 48 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  postButton: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  content: {
    flex: 1,
  },
  textInput: {
    fontSize: 16,
    color: colors.text,
    padding: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  mediaContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mediaItem: {
    position: 'relative',
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  editingTools: {
    backgroundColor: colors.cardBackground,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  editingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  editingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  editButton: {
    alignItems: 'center',
    padding: 8,
  },
  editButtonText: {
    fontSize: 12,
    color: colors.text,
    marginTop: 4,
  },
  doneEditingButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneEditingText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBackground,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  characterCount: {
    textAlign: 'right',
    paddingHorizontal: 16,
    paddingBottom: 120,
    fontSize: 12,
    color: colors.textSecondary,
  },
});
