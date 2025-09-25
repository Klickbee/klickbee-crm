// import DashBoard from "@/feature/dashboard/components";

import { Button } from "@/components/ui/Button";
import { Save } from "lucide-react"


export default function Ai() {
    return (
        <div className="py-8 px-6">
            <div className="border-[#E4E4E7] border-[1px] rounded-xl">
                <h2 className="text-base font-semibold leading-6 tracking-0 text-[#09090B] px-3 py-4">AI Settings</h2>
                <hr className="text-[#E4E4E7] " />
                <div className="px-3 py-4">
                    <h5 className="font-medium text-sm leading-[20px] tracking-[0px] text-black ">Select your AI Model</h5>
                    <div className="relative w-full h-9 mt-2">
                        <select
                            className=" w-full appearance-none rounded-md border border-[#E4E4E7] bg-white px-4 py-1.5 pr-10 text-sm font-normal text-[#09090B]  outline-none "
                        >
                            <option>GPT-4o</option>
                            <option>GPT-4 Turbo</option>
                            <option>GPT-5</option>
                        </select>

                        <svg
                            className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fill-rule="evenodd"
                                d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
                                clip-rule="evenodd"
                            />
                        </svg>
                    </div>
                    <h5 className="font-medium text-sm leading-[20px] tracking-[0px] text-black mt-3">Your API Key</h5>
                    <input className=" w-full rounded-md border border-[#E4E4E7] bg-white px-4 py-1.5 pr-10 text-sm font-normal text-[#09090B]  outline-none" />

                    <Button className="whitespace-nowrap bg-black mt-4">
                        <Save className="text-[#FAFAFA] h-4 w-4 " />
                        <span className="text-[#FAFAFA]">Save</span>
                    </Button>
                </div>
            </div>
            <div className="border-[#E4E4E7] border-[1px] rounded-xl mt-4">
                <h2 className="text-base font-semibold leading-6 tracking-0 text-[#09090B] px-3 py-4">AI Context</h2>
                <hr className="text-[#E4E4E7] " />
                <div className="px-3 py-4">
                    <p className="text-sm font-normal leading-[20px] text-[#71717A] text-muted">Please fill in the fields below to help us better understand your company's background and communication style. This information allows our AI to generate content, suggestions, or insights that are relevant, personalized, and aligned with your industry, tone, and objectives.</p>
                    <h5 className="font-medium text-sm leading-[20px] tracking-[0px] text-black mt-4 mb-1">Your Company Name</h5>
                    <textarea placeholder="Enter your company name" className="h-[80px] w-full rounded-md border border-[#E4E4E7] bg-white px-3 py-1.5 pr-10 text-sm font-normal text-[#09090B]  outline-none" />
                    <h5 className="font-medium text-sm leading-[20px] tracking-[0px] text-black mt-2 mb-1">Your Company Activities</h5>
                    <textarea placeholder="Enter your company activities" className="h-[80px] w-full rounded-md border border-[#E4E4E7] bg-white px-3 py-1.5 pr-10 text-sm font-normal text-[#09090B]  outline-none" />
                    <h5 className="font-medium text-sm leading-[20px] tracking-[0px] text-black mt-2 mb-1">Your Company Experience</h5>
                    <textarea placeholder="Enter your company experience" className="h-[80px] w-full rounded-md border border-[#E4E4E7] bg-white px-3 py-1.5 pr-10 text-sm font-normal text-[#09090B]  outline-none" />
                    <h5 className="font-medium text-sm leading-[20px] tracking-[0px] text-black mt-2 mb-1">Your Company Industry</h5>
                    <textarea placeholder="Enter your company industry" className="h-[80px] w-full rounded-md border border-[#E4E4E7] bg-white px-3 py-1.5 pr-10 text-sm font-normal text-[#09090B]  outline-none" />
                    <h5 className="font-medium text-sm leading-[20px] tracking-[0px] text-black mt-2 mb-1">Tone of voice
                        of your voice</h5>
                    <textarea  placeholder="Enter other relevant informations" className="h-[80px] w-full rounded-md border border-[#E4E4E7] bg-white px-3 py-1.5 pr-10 text-sm font-normal text-[#09090B]  outline-none" />
                    <h5 className="font-medium text-sm leading-[20px] tracking-[0px] text-black mt-2 mb-1">Other Relevant informations</h5>
                    <textarea placeholder="Enter your company placeholder" className="h-[80px] w-full rounded-md border border-[#E4E4E7] bg-white px-3 py-1.5 pr-10 text-sm font-normal text-[#09090B]  outline-none" />
                    <Button className="whitespace-nowrap bg-black mt-4">
                        <Save className="text-[#FAFAFA] h-4 w-4" />
                        <span className="text-[#FAFAFA]">Save</span>
                    </Button>
                </div>
            </div>
        </div>
    );

}
