"use client";
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/Button";
import { Save, Loader2 } from "lucide-react";
import { useEmailStore } from "../libs/emailStore";


export default function EmailForm() {
    const { settings, setSettings, saveSettings, sendInvite, loadSettings, isSaving, isSendingTest, isLoadingSettings, error, resetError } = useEmailStore();
    const [testEmail, setTestEmail] = useState('');

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);


    const handleSaveSettings = async () => {
        if (!isSaving && isFormValid()) {
            await saveSettings();
        }
    };

    const handleSendTest = async () => {
        if (testEmail && !isSendingTest) {
            await sendInvite(testEmail);
            setTestEmail('');
        }
    };

    const isFormValid = () => {
        return settings.host && settings.port && settings.sender && settings.username && settings.password;
    };

    return (
        <div className="py-8 px-6">
            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                    <button onClick={resetError} className="ml-2 text-red-500">×</button>
                </div>
            )}
            <div className="border-[#E4E4E7] border-[1px] rounded-xl">
                <h2 className="text-base font-semibold leading-6 tracking-0 text-[#09090B] px-3 py-4">Mail Settings</h2>
                <hr className="text-[#E4E4E7] " />
                <div className="px-3 py-4">
                    <h5 className="font-medium text-sm leading-[20px] tracking-[0px] text-black mb-1.5">E-mail Host</h5>
                    <input
                        className="w-full rounded-md border border-[#E4E4E7] bg-white px-4 py-1.5 pr-10 text-sm font-normal text-[#09090B] outline-none"
                        value={settings.host}
                        onChange={(e) => setSettings({ host: e.target.value })}
                        placeholder="smtp.example.com"
                    />

                    <h5 className="font-medium text-sm leading-[20px] tracking-[0px] text-black mt-3 mb-1.5">E-mail Port</h5>
                    <input
                        className="w-full rounded-md border border-[#E4E4E7] bg-white px-4 py-1.5 pr-10 text-sm font-normal text-[#09090B] outline-none"
                        value={settings.port}
                        onChange={(e) => setSettings({ port: e.target.value })}
                        placeholder="587"
                    />

                    <h5 className="font-medium text-sm leading-[20px] tracking-[0px] text-black mt-3 mb-1.5">Email Sender</h5>
                    <input
                        className="w-full rounded-md border border-[#E4E4E7] bg-white px-4 py-1.5 pr-10 text-sm font-normal text-[#09090B] outline-none"
                        value={settings.sender}
                        onChange={(e) => setSettings({ sender: e.target.value })}
                        placeholder="noreply@example.com"
                    />

                    <h5 className="font-medium text-sm leading-[20px] tracking-[0px] text-black mt-3 mb-1.5">E-mail Username</h5>
                    <input
                        className="w-full rounded-md border border-[#E4E4E7] bg-white px-4 py-1.5 pr-10 text-sm font-normal text-[#09090B] outline-none"
                        value={settings.username}
                        onChange={(e) => setSettings({ username: e.target.value })}
                        placeholder="username"
                        autoComplete="off"
                        data-form-type="other"
                    />

                    <h5 className="font-medium text-sm leading-[20px] tracking-[0px] text-black mt-3 mb-1.5">Email Password</h5>
                    <input
                        className="w-full rounded-md border border-[#E4E4E7] bg-white px-4 py-1.5 pr-10 text-sm font-normal text-[#09090B] outline-none"
                        type="password"
                        value={settings.password}
                        onChange={(e) => setSettings({ password: e.target.value })}
                        placeholder="password"
                        autoComplete="new-password"
                    />

                    <Button
                        className="whitespace-nowrap bg-black mt-4 w-auto"
                        onClick={handleSaveSettings}
                        disabled={!isFormValid() || isSaving}
                    >
                        {isSaving ? <Loader2 className="text-[#FAFAFA] h-4 w-4 animate-spin" /> : <Save className="text-[#FAFAFA] h-4 w-4" />}
                        <span className="text-[#FAFAFA]">Save Settings</span>
                    </Button>
                </div>
            </div>
            <div className="border-[#E4E4E7] border-[1px] rounded-xl mt-4">
                <h2 className="text-base font-semibold leading-6 tracking-0 text-[#09090B] px-3 py-4">E-mail Tester</h2>
                <hr className="text-[#E4E4E7] " />
                <div className="px-3 py-4">

                    <h5 className="font-medium text-sm leading-[20px] tracking-[0px] text-black mt-4 mb-1">Send Test To</h5>
                    <input
                        className="w-full rounded-md border border-[#E4E4E7] bg-white px-4 py-1.5 pr-10 text-sm font-normal text-[#09090B] outline-none"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        placeholder="test@example.com"
                    />

                    <Button
                        className="whitespace-nowrap bg-black mt-4"
                        onClick={handleSendTest}
                        disabled={!testEmail || isSendingTest}
                    >
                        {isSendingTest ? (
                            <Loader2 className="text-[#FAFAFA] h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="text-[#FAFAFA] h-4 w-4" />
                        )}
                        <span className="text-[#FAFAFA]">Send Test</span>
                    </Button>
                </div>
            </div>
        </div>
    );

}
