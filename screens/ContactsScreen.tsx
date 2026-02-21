import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Contact {
  id: number;
  username: string;
  email: string;
  public_key: string;
  status: string;
  added_at: string;
}

interface UserSearchResult {
  id: number;
  username: string;
  email: string;
  public_key: string;
  status: string;
}

export const ContactsScreen: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [accessToken, setAccessToken] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Theme Colors
  const Colors = {
    background: '#0A0A0A',
    primary: '#d4af37',
    secondary: '#8b4513',
    glass: 'rgba(26, 26, 26, 0.85)',
    border: 'rgba(212, 175, 55, 0.2)',
    textMain: '#EAEAEA',
    textSecondary: '#A0A0A0',
    inputBackground: '#101010',
    online: '#4CAF50',
    offline: '#666666',
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        setAccessToken(token);
        await fetchContacts(token);
      }
    } catch (error) {
      console.error('Failed to load contacts:', error);
    }
  };

  const fetchContacts = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/contacts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setContacts(data);
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    }
  };

  const searchUsers = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`http://localhost:3001/api/users/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const addContact = async (contactId: number) => {
    try {
      const response = await fetch('http://localhost:3001/api/contacts/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ contactId })
      });

      if (response.ok) {
        Alert.alert('Success', 'Contact added successfully');
        setSearchResults([]);
        setSearchQuery('');
        loadContacts(); // Refresh contacts list
      } else {
        const data = await response.json();
        Alert.alert('Error', data.error || 'Failed to add contact');
      }
    } catch (error) {
      console.error('Add contact failed:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    }
  };

  const removeContact = async (contactId: number, contactName: string) => {
    Alert.alert(
      'Remove Contact',
      `Are you sure you want to remove ${contactName} from your contacts?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`http://localhost:3001/api/contacts/remove`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ contactId })
              });

              if (response.ok) {
                Alert.alert('Success', 'Contact removed successfully');
                loadContacts(); // Refresh contacts list
              } else {
                const data = await response.json();
                Alert.alert('Error', data.error || 'Failed to remove contact');
              }
            } catch (error) {
              console.error('Remove contact failed:', error);
              Alert.alert('Error', 'Network error. Please try again.');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    return status === 'online' ? Colors.online : Colors.offline;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadContacts();
    setRefreshing(false);
  };

  const renderContact = ({ item }: { item: Contact }) => (
    <TouchableOpacity 
      style={[styles.contactItem, { backgroundColor: Colors.glass }]}
      onPress={() => {
        // Navigate to chat screen
        // navigation.navigate('Chat', { 
        //   chatId: `chat-${Math.min(item.id, userId)}-${Math.max(item.id, userId)}`,
        //   contactName: item.username,
        //   contactId: item.id
        // });
      }}
    >
      <View style={styles.contactInfo}>
        <View style={styles.avatar}>
          <Text style={[styles.avatarText, { color: Colors.primary }]}>
            {item.username[0].toUpperCase()}
          </Text>
        </View>
        <View style={styles.contactDetails}>
          <Text style={[styles.contactName, { color: Colors.textMain }]}>
            {item.username}
          </Text>
          <Text style={[styles.contactEmail, { color: Colors.textSecondary }]}>
            {item.email}
          </Text>
        </View>
      </View>
      <View style={styles.contactActions}>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]} />
        <TouchableOpacity 
          style={[styles.removeButton, { backgroundColor: Colors.secondary }]}
          onPress={() => removeContact(item.id, item.username)}
        >
          <Text style={[styles.removeButtonText, { color: Colors.textMain }]}>Remove</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderSearchResult = ({ item }: { item: UserSearchResult }) => (
    <View style={[styles.searchResultItem, { backgroundColor: Colors.glass }]}>
      <View style={styles.contactInfo}>
        <View style={styles.avatar}>
          <Text style={[styles.avatarText, { color: Colors.primary }]}>
            {item.username[0].toUpperCase()}
          </Text>
        </View>
        <View style={styles.contactDetails}>
          <Text style={[styles.contactName, { color: Colors.textMain }]}>
            {item.username}
          </Text>
          <Text style={[styles.contactEmail, { color: Colors.textSecondary }]}>
            {item.email}
          </Text>
        </View>
      </View>
      <TouchableOpacity 
        style={[styles.addButton, { backgroundColor: Colors.primary }]}
        onPress={() => addContact(item.id)}
      >
        <Text style={[styles.addButtonText, { color: '#000' }]}>Add</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: Colors.glass }]}>
        <TextInput
          style={[styles.searchInput, { 
            backgroundColor: Colors.inputBackground,
            color: Colors.textMain
          }]}
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            searchUsers(text);
          }}
          placeholder="Search users..."
          placeholderTextColor={Colors.textSecondary}
        />
      </View>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <View style={styles.searchResultsContainer}>
          <Text style={[styles.sectionTitle, { color: Colors.textMain }]}>
            Search Results
          </Text>
          <FlatList
            data={searchResults}
            renderItem={renderSearchResult}
            keyExtractor={(item) => item.id.toString()}
            style={styles.searchResultsList}
          />
        </View>
      )}

      {/* Contacts List */}
      <View style={styles.contactsContainer}>
        <Text style={[styles.sectionTitle, { color: Colors.textMain }]}>
          My Contacts ({contacts.length})
        </Text>
        <FlatList
          data={contacts}
          renderItem={renderContact}
          keyExtractor={(item) => item.id.toString()}
          style={styles.contactsList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: Colors.textSecondary }]}>
                No contacts yet. Search for users above to add them.
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
  },
  searchInput: {
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  searchResultsContainer: {
    flex: 1,
  },
  contactsContainer: {
    flex: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 16,
    paddingBottom: 8,
  },
  searchResultsList: {
    flex: 1,
  },
  contactsList: {
    flex: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactEmail: {
    fontSize: 14,
  },
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  addButton: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  removeButton: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  removeButtonText: {
    fontWeight: '600',
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
  },
});