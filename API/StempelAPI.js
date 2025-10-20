import axios from "axios";
import { SERVER } from "../config/config";

/**
 * API wrapper for /stempel endpoints.
 * Handles JWT authorization and all clock-in/out related requests.
 */

export default class StempelAPI {

    constructor(authorization = null) {
        this.baseAddress = SERVER + "/stempel/";
        console.log("DOTEST");
        if (authorization != null) {
            axios.defaults.headers.common["Authorization"] = authorization;
        }
    }

    /** ------------------ Basic Actions ------------------ **/

    async test() {
        return axios.post(this.baseAddress + "test");
    }

    /** ------------------ Clock In/Out ------------------ **/

    async clockIn() {
        return axios.post(this.baseAddress + "clock-in");
    }

    async clockOut() {
        return axios.post(this.baseAddress + "clock-out");
    }

    /** ------------------ Meal Break ------------------ **/

    async startMealBreak() {
        return axios.post(this.baseAddress + "meal-break/start");
    }

    async endMealBreak() {
        return axios.post(this.baseAddress + "meal-break/end");
    }

    /** ------------------ First Break ------------------ **/

    async startFirstBreak() {
        return axios.post(this.baseAddress + "first-break/start");
    }

    async endFirstBreak() {
        return axios.post(this.baseAddress + "first-break/end");
    }

    /** ------------------ Second Break ------------------ **/

    async startSecondBreak() {
        return axios.post(this.baseAddress + "second-break/start");
    }

    async endSecondBreak() {
        return axios.post(this.baseAddress + "second-break/end");
    }

    /** ------------------ Destination ------------------ **/

    async saveDestination(destinationData) {
        return axios.post(this.baseAddress + "destination", destinationData);
    }

    /** ------------------ Info ------------------ **/

    async saveInfo(infoData) {
        return axios.post(this.baseAddress + "info", infoData);
    }

    /** ------------------ Fetch Data ------------------ **/

    async getEmployeeHistory(employeeId) {
        return axios.get(this.baseAddress + "history/" + employeeId);
    }

    async getTodayRecord() {
        return axios.get(this.baseAddress + "today");
    }
}
