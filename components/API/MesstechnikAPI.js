import axios from "axios";
import { encode } from 'base64-arraybuffer';
import { Buffer } from "buffer";
import { SERVER } from "../../config/config";

/**
 * Basic API functionality for server persistance.
 */

export default class MesstechnikAPI {

    entities = {
        "alias": "alias",
        "watermeterModel": "watermeterModel"
    };

    constructor(authorization = null) {
        this.baseAddress = SERVER+"/api/";
        if (authorization != null) {
            axios.defaults.headers.common['Authorization'] = authorization;
        }
    }

    async login(username, password) {
        return axios.post(this.baseAddress + "authenticate", {}, {
            auth: {
                username: username,
                password: password
            }
        }).then((response) => {
            return response.headers.authorization;
        }).catch((err) => {
            throw new Error();
        })
    }

    async getAll(entity, onSuccessHandler, onErrorHandler) {
        return axios.get(this.baseAddress + entity)
            .then((response) => {
                if (onSuccessHandler != undefined) {
                    onSuccessHandler();
                }
                return response.data;
            })
            .catch((err) => {
                if (onErrorHandler != undefined) {
                    onErrorHandler();
                }
            });
    }


    async get(entity, id, onSuccessHandler, onErrorHandler) {
        return axios.get(this.baseAddress + entity + "/" + (id != undefined ? id : ""))
            .then((response) => {
                if (onSuccessHandler != undefined) {
                    onSuccessHandler();
                }
                return response.data;
            })
            .catch((err) => {
                if (onErrorHandler != undefined) {
                    onErrorHandler();
                }
            });
    }

    async getInstaller(entity, id, onSuccessHandler, onErrorHandler) {
        return axios.get(this.baseAddress + entity + "/installer/" + (id != undefined ? id : ""))
            .then((response) => {
                if (onSuccessHandler != undefined) {
                    onSuccessHandler();
                }
                return response.data;
            })
            .catch((err) => {
                if (onErrorHandler != undefined) {
                    onErrorHandler();
                }
            });
    }

    async getByEmail(entity, email, onSuccessHandler, onErrorHandler) {
        return axios.get(this.baseAddress + entity + "/email/" + (email != undefined ? email : ""))
            .then((response) => {
                if (onSuccessHandler != undefined) {
                    onSuccessHandler();
                }
                return response.data;
            })
            .catch((err) => {
                if (onErrorHandler != undefined) {
                    onErrorHandler();
                }
            });
    }

    async getModules(entity, id, onSuccessHandler, onErrorHandler) {
        return axios.get(this.baseAddress + entity + "/" + (id != undefined ? id : "") + "/roles")
            .then((response) => {
                if (onSuccessHandler != undefined) {
                    onSuccessHandler();
                }
                return response.data;
            })
            .catch((err) => {
                if (onErrorHandler != undefined) {
                    onErrorHandler();
                }
            });
    }

    async getUserSetting(entity, id, settingId, onSuccessHandler, onErrorHandler) {
        return axios.get(this.baseAddress + entity + "/user/" + (id != undefined ? id : "") + "/setting/" + (settingId != undefined ? settingId : ""))
            .then((response) => {
                if (onSuccessHandler != undefined) {
                    onSuccessHandler();
                }
                return response.data;
            })
            .catch((err) => {
                if (onErrorHandler != undefined) {
                    onErrorHandler();
                }
            });
    }

    async getAllSettingsFromUser(entity, id, onSuccessHandler, onErrorHandler) {
        return axios.get(this.baseAddress + entity + "/" + (id != undefined ? id : "") + "/settings")
            .then((response) => {
                if (onSuccessHandler != undefined) {
                    onSuccessHandler();
                }
                return response.data;
            })
            .catch((err) => {
                if (onErrorHandler != undefined) {
                    onErrorHandler();
                }
            });
    }

    async getByKey(entity, key, onSuccessHandler, onErrorHandler) {
        return axios.get(this.baseAddress + entity + "/key/" + (key != undefined ? key : ""))
            .then((response) => {
                if (onSuccessHandler != undefined) {
                    onSuccessHandler();
                }
                return response.data;
            })
            .catch((err) => {
                if (onErrorHandler != undefined) {
                    onErrorHandler();
                }
            });
    }

    async create(entity, data, onSuccessHandler, onErrorHandler) {
        return axios.post(this.baseAddress + entity, data)
            .then((result) => {
                if (onSuccessHandler != undefined) {
                    onSuccessHandler();
                }
                return result.data;
            }).catch((err) => {
                if (onErrorHandler != undefined) {
                    onErrorHandler();
                }
            })
    }

    async connect(entity, key, data, onSuccessHandler, onErrorHandler) {
        return axios.post(this.baseAddress + entity + "/" + (key != undefined ? key : ""), data)
            .then((result) => {
                if (onSuccessHandler != undefined) {
                    onSuccessHandler();
                }
                return result.data;
            }).catch((err) => {
                if (onErrorHandler != undefined) {
                    onErrorHandler();
                }
            })
    }

    async upload(entity, data, onSuccessHandler, onErrorHandler) {
        return axios.post(this.baseAddress + entity + "/", data, {
            headers: {
                "Content-Type": "multipart/form-data",
            }
        })
            .then((result) => {
                if (onSuccessHandler != undefined) {
                    onSuccessHandler();
                }
                return result.data;
            }).catch((err) => {
                if (onErrorHandler != undefined) {
                    onErrorHandler();
                }
            })
    }

    async disconnect(entity, operationId, interfaceId, onSuccessHandler, onErrorHandler) {
        return axios.delete(this.baseAddress + entity + "/" + operationId + "/interfaces/" + interfaceId)
            .then((result) => {
                if (onSuccessHandler != undefined) {
                    onSuccessHandler();
                }
                return result.data;
            }).catch(err => {
                if (onErrorHandler != undefined) {
                    onErrorHandler();
                }
            })
    }

    async getConnection(entity, id, onSuccessHandler, onErrorHandler) {
        return axios.get(this.baseAddress + entity + "/" + (id != undefined ? id : "") + "/interfaces")
            .then((response) => {
                if (onSuccessHandler != undefined) {
                    onSuccessHandler();
                }
                return response.data;
            })
            .catch((err) => {
                if (onErrorHandler != undefined) {
                    onErrorHandler();
                }
            });
    }

    async update(entity, id, newData, onSuccessHandler, onErrorHandler) {
        return axios.put(this.baseAddress + entity + "/" + id, newData)
            .then((result) => {
                if (onSuccessHandler != undefined) {
                    onSuccessHandler();
                }
                return result.data;
            }).catch(err => {
                if (onErrorHandler != undefined) {
                    onErrorHandler();
                }
            })
    }

    async delete(entity, id, onSuccessHandler, onErrorHandler) {
        return axios.delete(this.baseAddress + entity + "/" + id)
            .then((result) => {
                if (onSuccessHandler != undefined) {
                    onSuccessHandler();
                }
                return result.data;
            }).catch(err => {
                if (onErrorHandler != undefined) {
                    onErrorHandler();
                }
            })
    }

    async deleteSettingFromUser(entity, id, settingId, onSuccessHandler, onErrorHandler) {
        return axios.delete(this.baseAddress + entity + "/" + id + "/settings/" + settingId)
            .then((result) => {
                if (onSuccessHandler != undefined) {
                    onSuccessHandler();
                }
                return result.data;
            }).catch(err => {
                if (onErrorHandler != undefined) {
                    onErrorHandler();
                }
            })
    }
    async getOrderInfo(installerId, onSuccessHandler, onErrorHandler) {

        const url = `${SERVER}/orderInfo/installer/date/${installerId}`;
        return axios.get(url)
            .then((response) => {
                
                if (onSuccessHandler != undefined) {
                    onSuccessHandler();
                }

                return response.data;
            })
            .catch((err) => {
               
                if (onErrorHandler != undefined) {
                    onErrorHandler();
                }
            });
    }
   
   
    async getCalendarInfo(installerId, onSuccessHandler, onErrorHandler) {
        const url = `${SERVER}/order/calendarInfo/${installerId}`;
        return axios.get(url)
            .then((response) => {
                
                if (onSuccessHandler != undefined) {
                    onSuccessHandler();
                }

                return response.data;
            })
            .catch((err) => {
               
                if (onErrorHandler != undefined) {
                    onErrorHandler();
                }
            });
    }

    
    async getByOrderId(id, onSuccessHandler, onErrorHandler) {
        const url = `${SERVER}/order/${id}`;
        return axios.get(url)
            .then((response) => {
                
                if (onSuccessHandler != undefined) {
                    onSuccessHandler();
                }

                return response.data;
            })
            .catch((err) => {
               
                if (onErrorHandler != undefined) {
                    onErrorHandler();
                }
            });
    }
    async getContacts(onSuccessHandler, onErrorHandler) {
        const url = `${SERVER}/user`;
        try {
            const response = await axios.get(url);
    
            // Pass the response data to the success handler, if defined
            if (onSuccessHandler) {
                onSuccessHandler(response.data);
            }
    
            return response.data; // Return the list of users
        } catch (err) {
            // Pass the error to the error handler, if defined
            if (onErrorHandler) {
                onErrorHandler(err);
            }
            
            // Optionally, you can rethrow the error to handle it outside
            throw err; // Propagate the error
        }
    }

    async getApartmentUser(apartmentId, onSuccessHandler, onErrorHandler) {
        const url = `${SERVER}/client/apartment/${apartmentId}`;
        return axios.get(url)
            .then((response) => {
                
                if (onSuccessHandler != undefined) {
                    onSuccessHandler();
                }

                return response.data;
            })
            .catch((err) => {
               
                if (onErrorHandler != undefined) {
                    onErrorHandler();
                }
            });
    }
    
    async getOrderStatus(id, onSuccessHandler, onErrorHandler) {
        const url = `${SERVER}/orderStatus/${id}`;
        return axios.get(url)
            .then((response) => {
                
                if (onSuccessHandler != undefined) {
                    onSuccessHandler();
                }

                return response.data;
            })
            .catch((err) => {
               
                if (onErrorHandler != undefined) {
                    onErrorHandler();
                }
            });
    }

    async getObjectComments(objectNumber, onSuccessHandler, onErrorHandler) {
        const url = `${SERVER}/object/${objectNumber}/comments`;
        return axios.get(url)
            .then((response) => {
                if (onSuccessHandler != undefined) {
                    onSuccessHandler(response.data);
                }
                return response.data;
            })
            .catch((err) => {
                if (onErrorHandler != undefined) {
                    onErrorHandler(err);
                }
            });
    }

    async getApartmentComments(apartmentNumber, onSuccessHandler, onErrorHandler) {
        const url = `${SERVER}/apartment/${apartmentNumber}/comments`;
        return axios.get(url)
            .then((response) => {
                if (onSuccessHandler != undefined) {
                    onSuccessHandler(response.data);
                }
                return response.data;
            })
            .catch((err) => {
                if (onErrorHandler != undefined) {
                    onErrorHandler(err);
                }
            });
    }

    async getDeviceComments(deviceId, onSuccessHandler, onErrorHandler) {
        const url = `${SERVER}/devices/${deviceId}/comments`;
        return axios.get(url)
            .then((response) => {
                if (onSuccessHandler != undefined) {
                    onSuccessHandler(response.data);
                }
                return response.data;
            })
            .catch((err) => {
                if (onErrorHandler != undefined) {
                    onErrorHandler(err);
                }
            });
    }


    async getApartmentByOrderId(orderId, onSuccessHandler, onErrorHandler) {
        const url = `${SERVER}/apartment/order/${orderId}`;
        return axios.get(url)
            .then((response) => {
                if (onSuccessHandler != undefined) {
                    onSuccessHandler(response.data);
                }
                return response.data;
            })
            .catch((err) => {
                if (onErrorHandler != undefined) {
                    onErrorHandler(err);
                }
            });
    }

    async updateOrderStatus(id, statusId, onSuccessHandler, onErrorHandler) {
        const url = `${SERVER}/order/${id}/status/${statusId}`;

        return axios.put(url)
            .then((response) => {
                if (onSuccessHandler != undefined) {
                    onSuccessHandler(response.data);
                }
                return response.data;
            })
            .catch((err) => {
                if (onErrorHandler != undefined) {
                    onErrorHandler(err);
                }
            });
    }

    async getUserById(id, onSuccessHandler, onErrorHandler) {
        const url = `${SERVER}/user/${id}`;

        console.log("Request on:" + url);
        return axios.get(url)
            .then((response) => {
                
                if (onSuccessHandler != undefined) {
                    onSuccessHandler();
                }

                return response.data;
            })
            .catch((err) => {
               
                if (onErrorHandler != undefined) {
                    onErrorHandler();
                }
            });
    }

    async getByApp(name, onSuccessHandler, onErrorHandler) {
        
        const url = `${SERVER}/api/suggestion/app/${name}`;
        console.log("Request on:" + url);
        return axios.get(url)
            .then((response) => {
                
                if (onSuccessHandler != undefined) {
                    onSuccessHandler();
                }

                return response.data;
            })
            .catch((err) => {
               
                if (onErrorHandler != undefined) {
                    onErrorHandler();
                }
            });
    }
    async saveMessageLikes(suggestionObject, onSuccessHandler, onErrorHandler) {
        const url = `${SERVER}/api/suggestion/app`;
    
        // Remove the 'sender' key from suggestionObject
        delete suggestionObject.sender;
        console.log("Request data: ", JSON.stringify(suggestionObject));
    
        return axios.put(url, suggestionObject, {
            headers: {
                'Content-Type': 'application/json', 
            }
        })
        .then((response) => {

            
            if (onSuccessHandler) {
                onSuccessHandler();
            }
            return response.data;
        })
        .catch((err) => {
            if (onErrorHandler) {
                onErrorHandler(err);  
            }
        });
    }
    
    async addMessage(obj) {
        return axios.post(this.baseAddress + "suggestion/app", obj).then((response) => {
            return response.data;
        }).catch((err) => {
            console.log("Napak:" + err);
        })
    }


    async getInhouseApps(onSuccessHandler, onErrorHandler) {
        
        const url = `${SERVER}/apps`;
        console.log("Request on:" + url);
        return axios.get(url)
            .then((response) => {
                
                if (onSuccessHandler != undefined) {
                    onSuccessHandler();
                }

                return response.data;
            })
            .catch((err) => {
               
                console.log("Error:" + err)
                if (onErrorHandler != undefined) {
                    onErrorHandler();
                }
            });
    }

    async getInstallerCalendarInfoToDate(installer, fromDate, toDate, onSuccessHandler, onErrorHandler) {
        const formattedFromDate = fromDate.toISOString().slice(0, 10);
        const formattedToDate = toDate.toISOString().slice(0, 10);
    
        const url = `${SERVER}/order/calendarInfo/${installer}/date?fromDate=${formattedFromDate}&toDate=${formattedToDate}`;
        console.log("Request on: " + url);

        return axios
            .get(url)
            .then((response) => {
                if (onSuccessHandler) {
                    onSuccessHandler(response.data);
                }
                return response.data;
            })
            .catch((err) => {
                console.log("Error: " + err);
                if (onErrorHandler) {
                    onErrorHandler(err);
                }
            });
    }




    async getInhousePressedAppName(name,onSuccessHandler, onErrorHandler) {
        
        const url = `${SERVER}/app/${name}`;
        console.log("Request on:" + url);
        return axios.get(url)
            .then((response) => {
                
                if (onSuccessHandler != undefined) {
                    onSuccessHandler();
                }

                return response.data;
            })
            .catch((err) => {
               
                console.log("Error:" + err)
                if (onErrorHandler != undefined) {
                    onErrorHandler();
                }
            });

    }
async getCurentUser(email,onSuccessHandler, onErrorHandler) {
        
        const url = `${SERVER}/user/email/${email}`;
        console.log("Request on:" + url);
        return axios.get(url)
            .then((response) => {
                
                if (onSuccessHandler != undefined) {
                    onSuccessHandler();
                }

                return response.data;
            })
            .catch((err) => {
               
                console.log("Error:" + err)
                if (onErrorHandler != undefined) {
                    onErrorHandler();
                }
            });
        }
        async getInstallerCalendarInfoToDate(installer, fromDate, toDate, onSuccessHandler, onErrorHandler) {
            // Format the dates to "YYYY-MM-DD"
            const formattedFromDate = fromDate.toISOString().slice(0, 10); // Extract date only
            const formattedToDate = toDate.toISOString().slice(0, 10);
        
            // Construct the URL
            const url = `${SERVER}/order/calendarInfo/${installer}/date?fromDate=${formattedFromDate}&toDate=${formattedToDate}`;
            console.log("Request on: " + url);
        
            // Send the request
            return axios
                .get(url)
                .then((response) => {
                    if (onSuccessHandler) {
                        onSuccessHandler(response.data);
                    }
                    return response.data;
                })
                .catch((err) => {
                    console.log("Error: " + err);
                    if (onErrorHandler) {
                        onErrorHandler(err);
                    }
                });
        }

        async getObject(objectNumber,onSuccessHandler, onErrorHandler) {
        
            const url = `${SERVER}/object/${objectNumber}`;
            console.log("Request on:" + url);
            return axios.get(url)
                .then((response) => {
                    
                    if (onSuccessHandler != undefined) {
                        onSuccessHandler();
                    }
    
                    return response.data;
                })
                .catch((err) => {
                   
                    console.log("Error:" + err)
                    if (onErrorHandler != undefined) {
                        onErrorHandler();
                    }
                });
        
        }

        async getApartmentsByObjectNumber(objectNumber,onSuccessHandler, onErrorHandler) {
        
            const url = `${SERVER}/apartment/objectnumber/${objectNumber}`;
            console.log("Request on:" + url);
            return axios.get(url)
                .then((response) => {
                    
                    if (onSuccessHandler != undefined) {
                        onSuccessHandler();
                    }
    
                    return response.data;
                })
                .catch((err) => {
                   
                    console.log("Error:" + err)
                    if (onErrorHandler != undefined) {
                        onErrorHandler();
                    }
                });
                
        
        }

        async getDevicesByApartmentId(apartmentId,onSuccessHandler, onErrorHandler) {
        
            const url = `${SERVER}/devices/apartment/${apartmentId}`;
            console.log("Request on:" + url);
            return axios.get(url)
                .then((response) => {
                    
                    if (onSuccessHandler != undefined) {
                        onSuccessHandler();
                    }
    
                    return response.data;
                })
                .catch((err) => {
                   
                    console.log("Error:" + err)
                    if (onErrorHandler != undefined) {
                        onErrorHandler();
                    }
                });
        
        }

        async getFirstObjectOfDay(instalerId,onSuccessHandler, onErrorHandler) {
        
            const url = `${SERVER}/object/${instalerId}/today/address`;
            console.log("Request on:" + url);
            return axios.get(url)
                .then((response) => {
                    
                    if (onSuccessHandler != undefined) {
                        onSuccessHandler();
                    }
    
                    return response.data;
                })
                .catch((err) => {
                   
                    console.log("Error:" + err)
                    if (onErrorHandler != undefined) {
                        onErrorHandler();
                    }
                });
        
        }

        async getTodaysFirstOrder(instaler, onSuccessHandler, onErrorHandler) {
           
            const url = `${SERVER}/object/${instaler}/today/address`;
            console.log("Request on:" + url);
        
            return axios
                .get(url)
                .then((response) => {
                    if (onSuccessHandler) {
                        onSuccessHandler();
                    }
                    return response.data;
                })
                .catch((err) => {
                    console.error("Error:", err);
                    if (onErrorHandler) {
                        onErrorHandler(err);
                    }
                });
        }


        async saveClockInData() {
            return axios.post(this.baseAddress, {}, {
                auth: {
                    username: username,
                    password: password
                }
            }).then((response) => {
                return response.headers.authorization;
            }).catch((err) => {
                throw new Error();
            })
        }
        
        async getAppConfigByUserId(userId, onSuccessHandler, onErrorHandler) {
           
            const url = `${SERVER}app-config/app/user/${userId}`;
            console.log("Request on:" + url);
        
            return axios
                .get(url)
                .then((response) => {
                    if (onSuccessHandler) {
                        onSuccessHandler();
                    }
                    return response.data;
                })
                .catch((err) => {
                    console.error("Error:", err);
                    if (onErrorHandler) {
                        onErrorHandler(err);
                    }
                });
        }


        async getNotifications(userId, onSuccessHandler, onErrorHandler) {
           
            const url = `${SERVER}/notification/${userId}`;
        
            return axios
                .get(url)
                .then((response) => {
                    if (onSuccessHandler) {
                        onSuccessHandler();
                    }
                    return response.data;
                })
                .catch((err) => {
                    console.error("Error:", err);
                    if (onErrorHandler) {
                        onErrorHandler(err);
                    }
                });
        }
        async getNotifications(userId, onSuccessHandler, onErrorHandler) {
           
            const url = `${SERVER}/notification/unseen/${userId}`;
        
            return axios
                .get(url)
                .then((response) => {
                    if (onSuccessHandler) {
                        onSuccessHandler();
                    }
                    return response.data;
                })
                .catch((err) => {
                    console.error("Error:", err);
                    if (onErrorHandler) {
                        onErrorHandler(err);
                    }
                });
        }

        async saveNotification(notification, onSuccessHandler, onErrorHandler) {
            const url = `${SERVER}/notification`;
        
            return axios
                .post(url, notification)
                .then((response) => {
                    if (onSuccessHandler) {
                        onSuccessHandler(response.data);
                    }
                    return response.data;
                })
                .catch((err) => {
                    console.error("Error:", err);
                    if (onErrorHandler) {
                        onErrorHandler(err);
                    }
                });
        }

        async uploadProfilePhoto(file, onSuccessHandler, onErrorHandler) {
            const url = `${SERVER}/uploadProfilePhoto`;
            const formData = new FormData();
            formData.append('file', {
                uri: file.uri,
                type: file.type,
                name: file.name,
            });
        
            return axios
                .post(url, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                })
                .then((response) => {
                    if (onSuccessHandler) {
                        onSuccessHandler(response.data);
                    }
                    return response.data;
                })
                .catch((err) => {
                    console.error("Error:", err);
                    if (onErrorHandler) {
                        onErrorHandler(err);
                    }
                });
        }

        async getProfilePhoto(userId, onSuccessHandler, onErrorHandler) {
            const url = `${SERVER}/profilePhoto/${userId}`;
            return axios
                .get(url, { responseType: 'arraybuffer' })
                .then((response) => {
                    const base64Image = encode(response.data);
                    const imageSrc = `data:image/jpeg;base64,${base64Image}`;
                    if (onSuccessHandler) {
                        onSuccessHandler(imageSrc);
                    }
                    return imageSrc;
                })
                .catch((err) => {
                    console.error("Error:", err);
                    if (onErrorHandler) {
                        onErrorHandler(err);
                    }
                });
        }



        async getImagesByTargetTypeAndTargetId(targetType, targetId) {
            const url = `${SERVER}/photos/target/${targetType}/${targetId}`;
            try {
                const response = await axios.get(url); // Remove { responseType: 'arraybuffer' }
                if (response.data && Array.isArray(response.data)) {
                    return response.data; // Since it's already Base64 strings
                }
                return [];
            } catch (err) {
                console.error("Error fetching images:", err);
                return [];
            }
        }


        async getProfilePhotos(userId, onSuccessHandler, onErrorHandler) {
            const url = `${SERVER}/profilePhoto/${userId}`;
        
            axios
              .get(url, { responseType: 'arraybuffer' }) 
              .then((response) => {
                
                const base64Image = `data:image/jpeg;base64,${Buffer.from(response.data, 'binary').toString('base64')}`;
        
                
                
                if (onSuccessHandler) {
                  onSuccessHandler(base64Image);
                }
              })
              .catch((err) => {
                console.error("error getting photo:", err);
                if (onErrorHandler) {
                  onErrorHandler(err);
                }
              });
          }
        
        
        
}