import { getAndroidBinariesRoot } from "./utils/binaries";

import { main as appmiumMain } from "appium";
import * as wd from "wd";
import {
  clickOnElement,
  inputText,
  installAppToDeviceName,
} from "./utils/utilities";
import { newUser } from "./utils/create_account";
import { DesiredCapabilities } from "@wdio/types/build/Capabilities";

const androidAppFullPath = `${getAndroidBinariesRoot()}/session-1.13.1-x86.apk`;

const sharedCapabilities: DesiredCapabilities = {
  platformName: "Android",
  platformVersion: "11",
  app: androidAppFullPath,
  appPackage: "network.loki.messenger",
  appActivity: "network.loki.messenger.RoutingActivity",
  automationName: "UiAutomator2",
  browserName: "",
  newCommandTimeout: 300000,
};

const emulator1Udid = "emulator-5554";
const emulator2Udid = "emulator-5556";

const capabilities1: DesiredCapabilities = {
  ...sharedCapabilities,
  udid: emulator1Udid,
};
const capabilities2: DesiredCapabilities = {
  ...sharedCapabilities,
  udid: emulator2Udid,
};

describe("Start server", () => {
  it("test should open server", async () => {
    // first we want to install the app on each device with our custom call to run it
    await Promise.all([
      installAppToDeviceName(androidAppFullPath, emulator1Udid),
      installAppToDeviceName(androidAppFullPath, emulator2Udid),
    ]);

    const server = await appmiumMain({
      port: 4723,
      host: "localhost",
      setTimeout: 30000,
    });

    const [device1, device2] = await Promise.all([
      await wd.promiseChainRemote("localhost", 4723),
      await wd.promiseChainRemote("localhost", 4723),
    ]);
    await Promise.all([
      device1.init(capabilities1),
      device2.init(capabilities2),
    ]);

    const [_userA, userB] = await Promise.all([
      newUser(device1, "User A"),
      newUser(device2, "User B"),
    ]);

    // USER A WORKFLOW
    // Send message from User A to User B
    // Click new conversation button
    await clickOnElement(device1, "New conversation button");
    // Select direct message option
    await clickOnElement(device1, "New direct message");
    // Enter in User B's session ID
    await inputText(device1, "Session id input box", userB.sessionID);
    // Click next
    await clickOnElement(device1, "Next");
    // Type in the message input box
    await inputText(
      device1,
      "Message input box",
      "Test-message-User-A-to-User-B"
    );
    // CLick send
    await clickOnElement(device1, "Send message button");
    await device1.setImplicitWaitTimeout(20000);
    await device2.setImplicitWaitTimeout(20000);
    // Wait for tick
    await device1.elementByAccessibilityId("Message sent status tick");
    // Wait for response

    // Verify config message states message request was accepted
    // await device1.elementByAccessibilityId("Message request was accepted");
    // USER B WORKFLOW
    // Click on message request panel
    await clickOnElement(device2, "Message requests banner");
    // Select message from User A
    await clickOnElement(device2, "Message request");
    // Type into message input box
    await inputText(
      device2,
      "Message input box",
      "Test-message-User-B-to-User-A"
    );
    // Click send
    await clickOnElement(device2, "Send message button");
    // Wait for tick

    await device1.quit();
    await device2.quit();

    console.info("waiting server close");

    await server.close();
    console.info(" server closed");
  }).timeout(300000);
});
