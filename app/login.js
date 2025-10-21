import { useEffect, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { decode as atob, encode } from 'base-64';
import { openDatabaseSync } from 'expo-sqlite';
import { ArrowUpCircleIcon } from 'react-native-heroicons/outline';
import { ActivityIndicator } from 'react-native-paper';
import { useDispatch } from 'react-redux';

import { useLocalSearchParams, useRouter } from 'expo-router';
import MesstechnikAPI from '../API/MesstechnikAPI';
import { SERVER } from '../config/config';
import { setAuthData } from './authSlice';

// Lazy database initialization - don't open at module level
let db = null;
const getDatabase = () => {
  if (!db) {
    try {
      db = openDatabaseSync('mt-app.db');
    } catch (error) {
      console.error('Error opening database:', error);
      throw error;
    }
  }
  return db;
};

const LoginScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstUser, setFirstUser] = useState({ id: null, username: '', password: '', token: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [offlineUser, setOfflineUser] = useState(null);
  const [isAutoLogin, setIsAutoLogin] = useState(false);
  const dispatch = useDispatch();
  const justLoggedOut = params?.justLoggedOut === 'true';

  // ----------------- SQLite Methods -----------------
  const dropUserTable = () => {
    try {
      const database = getDatabase();
      database.withTransactionSync(() => {
        database.execSync(`DROP TABLE IF EXISTS users;`);
      });
      console.log('User table dropped.');
    } catch (err) {
      console.error('Error dropping user table:', err.message);
    }
  };

  const createUserTable = () => {
    try {
      const database = getDatabase();
      database.withTransactionSync(() => {
        database.execSync(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            username TEXT UNIQUE,
            password TEXT,
            token TEXT,
            firstName TEXT,
            lastName TEXT
          );
        `);
      });
      console.log('User table created.');
    } catch (err) {
      console.error('Error creating user table:', err.message);
    }
  };

  const saveUserToLocalDB = (id, username, password, token, firstName = '', lastName = '') => {
    try {
      const database = getDatabase();
      database.withTransactionSync(() => {
        const result = database.getFirstSync(
          `SELECT COUNT(*) AS count FROM users WHERE id = ?;`,
          [id]
        );

        if (result.count === 0) {
          database.runSync(
            `INSERT INTO users (id, username, password, token, firstName, lastName) VALUES (?, ?, ?, ?, ?, ?);`,
            [id, username, password, token, firstName, lastName]
          );
          console.log(`User "${username}" saved locally with token.`);
        } else {
          database.runSync(
            `UPDATE users SET username = ?, password = ?, token = ?, firstName = ?, lastName = ? WHERE id = ?;`,
            [username, password, token, firstName, lastName, id]
          );
          console.log(`User "${username}" updated locally with token.`);
        }
      });
    } catch (err) {
      console.error('Error saving user locally:', err.message);
    }
  };

  const getAllUsers = () => {
    try {
      const database = getDatabase();
      const users = database.getAllSync(`SELECT * FROM users;`);
      const match = users.find(u => u.username === email && u.password === password);
      setOfflineUser(match || null);

      if (match) {
        console.log('Offline user matched:', match.username);
        logInOffline(match.id, match.username, match.token);
      } else {
        console.log('Offline user not found or credentials invalid.');
      }
    } catch (err) {
      console.error('Error fetching users:', err.message);
    }
  };

  const getFirstUser = () => {
    try {
      const database = getDatabase();
      const users = database.getAllSync(`SELECT * FROM users;`);
      if (users.length > 0) {
        const first = users[0];

        if (first.token && isTokenValid(first.token)) {
          console.log('Token valid, auto-login user.');
          console.log("Just logged out:" + justLoggedOut + "|" + params?.justLoggedOut);

          // Don't auto-login if user just logged out
          if (justLoggedOut) {
            console.log('User just logged out, skipping auto-login.');
            return;
          }

          // Fill form and trigger auto-login via useEffect
          setIsAutoLogin(true);
          setEmail(first.username);
          setPassword(first.password);
        } else {
          setFirstUser({ id: first.id, username: first.username, password: first.password, token: first.token });
        }
      }
    } catch (err) {
      console.error('Error getting first user:', err.message);
    }
  };

  const isTokenValid = (token) => {
    if (!token) return false;
    try {
      const payloadBase64 = token.split('.')[1];
      if (!payloadBase64) return false;
      const decodedPayload = JSON.parse(atob(payloadBase64));
      const nowInSeconds = Math.floor(Date.now() / 1000);
      return decodedPayload.exp && decodedPayload.exp > nowInSeconds;
    } catch (err) {
      console.error('Error decoding token:', err);
      return false;
    }
  };

  // ----------------- Effect on Mount -----------------
  useEffect(() => {
    createUserTable();
    getFirstUser();
  }, []);

  useEffect(() => {
    if (!email && firstUser.username) {
      setEmail(firstUser.username);
      setPassword(firstUser.password);
    }
  }, [firstUser]);

  useEffect(() => {
    if (isAutoLogin && email && password) {
      console.log('Auto-login: Form filled, triggering login...');
      checkInternetAndExecute();
    }
  }, [isAutoLogin, email, password]);

  // ----------------- Network & Login -----------------
  const checkInternet = async () => {
    try {
      const res = await fetch('https://www.google.com', { method: 'HEAD' });
      return res.ok;
    } catch {
      return false;
    }
  };

  const checkInternetAndExecute = async () => {
    setIsLoading(true);
    const online = await checkInternet();

    if (online) {
      await logIn();
    } else {
      console.log('No internet connection. Using local DB.');
      getAllUsers();
    }

    setIsLoading(false);
  };

  const logIn = async () => {
    try {
      const authHeader = 'Basic ' + encode(`${email}:${password}`);
      const response = await fetch(`${SERVER}/authenticate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify({ username: email, password }),
      });

      if (!response.ok) {
        console.log('Login failed. Status:', response.status);
        return false;
      }

      const token = response.headers.get('Authorization');
      const api = new MesstechnikAPI(token);
      const user = await api.getCurentUser(email);

      dispatch(setAuthData({
        token,
        email,
        userId: user.id.toString(),
        textPassword: password,
      }));

      saveUserToLocalDB(user.id, email, password, token, user.firstName, user.lastName);

      console.log("Logged in with auth token:" + token);

      if (isAutoLogin) {
        router.replace(`/Menu?userId=${user.id}&token=${token}&autoLogin=true`);
        setIsAutoLogin(false);
      } else {
        router.replace(`/Menu?userId=${user.id}&token=${token}`);
      }

      return true;
    } catch (err) {
      console.error('Error logging in:', err);
      return false;
    }
  };

  const logInOffline = (id, username, token) => {
    console.log('Logged in offline as', username);

    dispatch(setAuthData({
      token: token || '',
      email: username,
      userId: id ? id.toString() : '',
    }));

    router.replace(`/Menu?userId=${id}&token=${token}`);
  };

  // ----------------- UI -----------------
  return (
    <View style={styles.parentContainer}>
      <Image
        style={styles.imageContainer}
        source={require('../assets/images/company_front_logo.jpg')}
      />
      <View style={styles.headerContainer}>
        <Text style={styles.inputText}>Anmelden</Text>

        {isLoading ? (
          <ActivityIndicator size="large" color="#6082B6" />
        ) : (
          <>
            <TextInput
              style={styles.nameInput}
              placeholder="Email"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.nameInput}
              placeholder="Passwort"
              placeholderTextColor="#aaa"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={checkInternetAndExecute}
          >
            <ArrowUpCircleIcon size={20} color="#6082B6" />
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  parentContainer: { flex: 1, backgroundColor: '#f8f9fa' },
  imageContainer: { width: '100%', height: '40%', resizeMode: 'cover' },
  headerContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  inputText: { marginBottom: 20, fontSize: 24, fontWeight: 'bold', color: '#333' },
  nameInput: {
    height: 45,
    width: '100%',
    fontSize: 16,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#f0f0f0',
  },
  buttonContainer: { width: '100%', alignItems: 'center', marginTop: 20 },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  loginText: { marginLeft: 10, fontSize: 18, color: '#666' },
});

export default LoginScreen;
