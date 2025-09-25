// import DashBoard from "@/feature/dashboard/components";

import { Button } from "@/components/ui/Button";
import { Save } from "lucide-react"


export default function Email() {
    return (
        <div className="py-8 px-6">
            <div className="border-[#E4E4E7] border-[1px] rounded-xl">
                <h2 className="text-base font-semibold leading-6 tracking-0 text-[#09090B] px-3 py-4">AI Settings</h2>
                <hr className="text-[#E4E4E7] " />
                <div className="px-3 py-4">
                    <h5 className="font-medium text-sm leading-[20px] tracking-[0px] text-black mb-1.5">E-mail Host</h5>
                    <input className=" w-full rounded-md border border-[#E4E4E7] bg-white px-4 py-1.5 pr-10 text-sm font-normal text-[#09090B]  outline-none" />

                    <h5 className="font-medium text-sm leading-[20px] tracking-[0px] text-black mt-3 mb-1.5">E-mail Port</h5>
                    <input className=" w-full rounded-md border border-[#E4E4E7] bg-white px-4 py-1.5 pr-10 text-sm font-normal text-[#09090B]  outline-none" />

                    <h5 className="font-medium text-sm leading-[20px] tracking-[0px] text-black mt-3 mb-1.5">Email Sender</h5>
                    <input className=" w-full rounded-md border border-[#E4E4E7] bg-white px-4 py-1.5 pr-10 text-sm font-normal text-[#09090B]  outline-none" />

                    <h5 className="font-medium text-sm leading-[20px] tracking-[0px] text-black mt-3 mb-1.5">E-mail Username</h5>
                    <input className=" w-full rounded-md border border-[#E4E4E7] bg-white px-4 py-1.5 pr-10 text-sm font-normal text-[#09090B]  outline-none" />

                    <h5 className="font-medium text-sm leading-[20px] tracking-[0px] text-black mt-3 mb-1.5">Email Password</h5>
                     <input className=" w-full rounded-md border border-[#E4E4E7] bg-white px-4 py-1.5 pr-10 text-sm font-normal text-[#09090B]  outline-none" />

                    <Button className="whitespace-nowrap bg-black mt-4 w-auto">
                        <Save className="text-[#FAFAFA] h-4 w-4 " />
                        <span className="text-[#FAFAFA]">Send Invite</span>
                    </Button>
                </div>
            </div>
            <div className="border-[#E4E4E7] border-[1px] rounded-xl mt-4">
                <h2 className="text-base font-semibold leading-6 tracking-0 text-[#09090B] px-3 py-4">E-mail Tester</h2>
                <hr className="text-[#E4E4E7] " />
                <div className="px-3 py-4">
                    <h5 className="font-medium text-sm leading-[20px] tracking-[0px] text-black  mb-1">Send Test To</h5>
                     <input className=" w-full rounded-md border border-[#E4E4E7] bg-white px-4 py-1.5 pr-10 text-sm font-normal text-[#09090B]  outline-none" />

                    <Button className="whitespace-nowrap bg-black mt-4">
                        <Save className="text-[#FAFAFA] h-4 w-4" />
                        <span className="text-[#FAFAFA]">Send Test</span>
                    </Button>
                </div>
            </div>
        </div>
    );

}
