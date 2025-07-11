import React, { useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';

const mockVideos = [
    {
        id: '1',
        videoUrl: 'http://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
        user: {
            name: 'John Doe',
            avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
        },
        caption: 'This is a beautiful buck! #nature #bunny',
        likes: '123K',
        comments: '456',
        shares: '789',
    },
    {
        id: '2',
        videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        user: {
            name: 'Jane Smith',
            avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
        },
        caption: 'Having fun with the team! #work #fun',
        likes: '245K',
        comments: '1.2K',
        shares: '987',
    },
    {
        id: '3',
        videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        user: {
            name: 'Sam Wilson',
            avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
        },
        caption: 'Elephants are majestic creatures. #wildlife #elephants',
        likes: '500K',
        comments: '3.1K',
        shares: '2.5K',
    },
];

const { height } = Dimensions.get('window');

// A component for a single video item in the list
const VideoItem = ({ item, isVisible }) => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const onPlayPausePress = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pauseAsync();
            } else {
                videoRef.current.playAsync();
            }
            setIsPlaying(!isPlaying);
        }
    };

    React.useEffect(() => {
        if (isVisible && !isPlaying) {
             onPlayPausePress();
        }
        if (!isVisible && isPlaying) {
             onPlayPausePress();
        }
    }, [isVisible]);


    return (
        <View style={styles.videoContainer}>
            <Pressable onPress={onPlayPausePress} style={styles.videoPressable}>
                 <Video
                    ref={videoRef}
                    source={{ uri: item.videoUrl }}
                    style={styles.video}
                    resizeMode={ResizeMode.COVER}
                    shouldPlay={false}
                    isLooping
                    onPlaybackStatusUpdate={(status) => {
                        if (status.isLoaded) {
                            setIsPlaying(status.isPlaying);
                        }
                    }}
                />
            </Pressable>

            <View style={styles.overlay}>
                <View style={styles.leftContainer}>
                    <View style={styles.userInfo}>
                        <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
                        <Text style={styles.username}>{item.user.name}</Text>
                    </View>
                    <Text style={styles.caption}>{item.caption}</Text>
                </View>
                <View style={styles.rightContainer}>
                    <TouchableOpacity style={styles.iconContainer}>
                        <Ionicons name="heart" size={30} color="white" />
                        <Text style={styles.iconText}>{item.likes}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconContainer}>
                        <Ionicons name="chatbubble-ellipses" size={30} color="white" />
                        <Text style={styles.iconText}>{item.comments}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconContainer}>
                        <Ionicons name="share-social" size={30} color="white" />
                        <Text style={styles.iconText}>{item.shares}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default function VideosScreen() {
    const [viewableItems, setViewableItems] = useState([]);

    const viewabilityConfig = {
      itemVisiblePercentThreshold: 50 // Item is considered visible when 50% of it is visible
    };

    const onViewableItemsChanged = useCallback(({ viewableItems: newViewableItems }) => {
        setViewableItems(newViewableItems.map(item => item.key));
    }, []);
    
    const renderItem = useCallback(
      ({ item }) => <VideoItem item={item} isVisible={viewableItems.includes(item.id)} />,
      [viewableItems]
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={mockVideos}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                pagingEnabled
                showsVerticalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                getItemLayout={(data, index) => (
                    {length: height, offset: height * index, index}
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    videoContainer: {
        width: '100%',
        height: height,
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoPressable: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    video: {
        ...StyleSheet.absoluteFillObject,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        paddingBottom: 80, // Adjust this to avoid tab bar overlap
    },
    leftContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
    },
    rightContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 10,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'white',
        marginRight: 10,
    },
    username: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    caption: {
        color: 'white',
        fontSize: 14,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 25,
    },
    iconText: {
        color: 'white',
        fontSize: 12,
        marginTop: 5,
    },
});