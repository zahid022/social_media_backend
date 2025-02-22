import { Injectable } from "@nestjs/common";
import admin from "firebase-admin"
const serviceAccount = require("../../../keys/firebase.json");

@Injectable()
export class FirebaseService {
    public firebaseApp : admin.app.App

    constructor() {
        this.firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }
}