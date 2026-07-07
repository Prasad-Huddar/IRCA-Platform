import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { FontAwesome } from '@expo/vector-icons';

interface AppHeaderProps {
    showAuth?: boolean;
}

export default function AppHeader({ showAuth = true }: AppHeaderProps) {
    const navigation = useNavigation<any>();
    const { user, isAuthenticated, logout } = useAuth();
    const [showDropdown, setShowDropdown] = React.useState(false);

    const menuOptions = [
        { label: 'Kannada / English', icon: 'language', action: () => console.log('Toggle Language') },
        { label: 'Report', icon: 'flag', action: () => console.log('Report') },
        { label: 'Settings', icon: 'cog', action: () => console.log('Settings') },
        { label: 'Events', icon: 'calendar', action: () => navigation.navigate('Events') }
    ];

    const handleLogout = () => {
        logout();
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <View style={styles.leftSection}>
                    <Text style={styles.headerTitle}>IRCA</Text>
                    <Text style={styles.headerDot}>•</Text>
                    <Text style={styles.headerPlatform}>Platform</Text>
                </View>

                {showAuth && (
                    <View style={styles.authActions}>
                        {isAuthenticated ? (
                            <TouchableOpacity onPress={handleLogout} style={styles.authAction}>
                                <View style={styles.avatarCircle}>
                                    <Text style={styles.avatarText}>
                                        {user?.first_name?.charAt(0) || 'U'}
                                    </Text>
                                </View>
                                <FontAwesome name="sign-out" size={16} color="#B3D9FF" style={styles.logoutIcon} />
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.loginContainer}>
                                <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginButton}>
                                    <Text style={styles.loginText}>Login</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Options Dropdown Trigger - Visible to ALL users */}
                        <View style={{ marginLeft: 15, position: 'relative', zIndex: 20 }}>
                            <TouchableOpacity
                                style={styles.menuTrigger}
                                onPress={() => setShowDropdown(!showDropdown)}
                            >
                                <FontAwesome name="bars" size={16} color="#FFFFFF" />
                            </TouchableOpacity>

                            {showDropdown && (
                                <View style={styles.dropdownMenu}>
                                    {menuOptions.map((opt, i) => (
                                        <TouchableOpacity
                                            key={i}
                                            style={styles.dropdownItem}
                                            onPress={() => {
                                                setShowDropdown(false);
                                                opt.action();
                                            }}
                                        >
                                            <FontAwesome name={opt.icon as any} size={14} color="#495057" style={{ width: 20 }} />
                                            <Text style={styles.dropdownText}>{opt.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: '#003366',
    },
    header: {
        height: 60,
        backgroundColor: '#003366',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    headerDot: {
        color: '#3B82F6',
        fontSize: 20,
        fontWeight: '900',
        marginHorizontal: 4,
    },
    headerPlatform: {
        color: '#B3D9FF',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    authActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    authAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    avatarCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    logoutIcon: {
        marginLeft: 4,
    },
    loginContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    loginButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    loginText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    menuTrigger: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
    },
    dropdownMenu: {
        position: 'absolute',
        top: 40,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        paddingVertical: 4,
        minWidth: 140,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 8,
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F8F9FA'
    },
    dropdownText: {
        fontSize: 14,
        color: '#212529',
        marginLeft: 8,
        fontWeight: '500'
    }
});
