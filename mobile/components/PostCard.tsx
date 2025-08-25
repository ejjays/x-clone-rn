import type { Post, User, Reaction, ReactionName } from "@/types";
import { formatDate, formatNumber } from "@/utils/formatters";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  type View as RNView,
  Pressable,
  Dimensions,
  Modal,
  StyleSheet,
  PanResponder,
  Animated,
} from "react-native";
import CommentIcon from "../assets/icons/Comment";
import ShareIcon from "../assets/icons/ShareIcon";
import { useRef, useState, useEffect, useCallback } from "react";
import PostReactionsPicker from "./PostReactionsPicker";
import * as Haptics from "expo-haptics";
import LikeIcon from "../assets/icons/LikeIcon";
import { Video, ResizeMode } from "expo-av";
import {
  reactionComponents,
  reactionTextColor,
  reactionLabels,
} from "@/utils/reactions";
import { FontAwesome, AntDesign, Fontisto } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import * as Clipboard from 'expo-clipboard';
import { cacheManager } from "@/utils/offline/CacheManager";

const getDynamicPostTextStyle = (content: string): string => {
  if (content.length <= 60) {
    return "text-2xl font-semibold";
  } else if (content.length > 60 && content.length <= 150) {
    return "text-xl font-semibold";
  } else {
    return "text-lg font-normal";
  }
};