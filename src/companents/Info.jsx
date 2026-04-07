import Jeep from "../assets/Jeep.jpg";
import { Search, CalendarCheck, Smile, ShieldCheck, BadgeDollarSign, MonitorSmartphone } from "lucide-react";

const Info = () => {
  const howItWorks = [
    {
      id: 1,
      title: "Browse and select",
      description:
        "Choose from our wide range of premium cars, select the pickup and return dates and locations that suit you best.",
      icon: <Search size={20} strokeWidth={2.2} />,
    },
    {
      id: 2,
      title: "Book and confirm",
      description:
        "Book your desired car with just a few clicks and receive an instant confirmation via email or SMS.",
      icon: <CalendarCheck size={20} strokeWidth={2.2} />,
    },
    {
      id: 3,
      title: "Enjoy your ride",
      description:
        "Pick up your car at the designated location and enjoy your premium driving experience with our top-quality service.",
      icon: <Smile size={20} strokeWidth={2.2} />,
    },
  ];

  const benefits = [
    {
      id: 1,
      title: "Quality Choice",
      description:
        "We offer a wide range of high-quality vehicles to choose from, including luxury cars, SUVs, vans, and more.",
      icon: <ShieldCheck size={20} strokeWidth={2.2} />,
    },
    {
      id: 2,
      title: "Affordable Prices",
      description:
        "Our rental rates are highly competitive and affordable, allowing our customers to enjoy their trips without breaking the bank.",
      icon: <BadgeDollarSign size={20} strokeWidth={2.2} />,
    },
    {
      id: 3,
      title: "Convenient Online Booking",
      description:
        "With our easy-to-use online booking system, customers can quickly and conveniently reserve their rental car from anywhere, anytime.",
      icon: <MonitorSmartphone size={20} strokeWidth={2.2} />,
    },
  ];

  return (
    <div className="w-full mt-30">
      <section className="bg-[#f8f8f8] py-10 sm:py-14 md:py-20 px-3 sm:px-4 md:px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center max-w-[760px] mx-auto mb-8 sm:mb-10 md:mb-14">
            <h2 className="text-[28px] sm:text-[38px] md:text-[48px] font-bold text-black leading-tight">
              How it works
            </h2>
            <p className="text-[#6b6b6b] text-sm sm:text-base md:text-[15px] mt-3 leading-6">
              Renting a luxury car has never been easier. Our streamlined process
              makes it simple for you to book and confirm your vehicle of choice online.
            </p>
          </div>

          <div className="bg-white rounded-[28px] sm:rounded-[32px] md:rounded-[40px] px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-8 items-stretch">
              <div className="flex flex-col gap-4 sm:gap-5 justify-center order-2 lg:order-1">
                {howItWorks.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-[#ececec] rounded-[22px] sm:rounded-[24px] px-4 sm:px-5 md:px-6 py-4 sm:py-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-[48px] h-[48px] sm:w-[54px] sm:h-[54px] rounded-[16px] bg-[#f2f2f2] flex items-center justify-center text-black shrink-0">
                        {item.icon}
                      </div>

                      <div>
                        <h3 className="text-[16px] sm:text-[18px] font-semibold text-black mb-1.5">
                          {item.title}
                        </h3>
                        <p className="text-[#666666] text-[13px] sm:text-[14px] leading-6">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

<div className="order-1 lg:order-2 flex justify-center">
  <div className="relative bg-[#fafafa] rounded-[32px] overflow-hidden p-6 w-fit flex items-center justify-center">

    <div className="absolute top-0 right-0 w-[65%] h-[38%] bg-[#ededed] rounded-bl-[40px]"></div>
    <div className="absolute bottom-0 left-0 w-[55%] h-[30%] bg-[#ededed] rounded-tr-[40px]"></div>

    <img
      src={Jeep}
      alt="Jeep"
      className="relative z-10 max-w-[700px] w-full h-auto object-contain rounded-[32px] drop-shadow-[0_25px_50px_rgba(0,0,0,0.25)]"
    />

  </div>
</div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black py-10 sm:py-14 md:py-20 px-3 sm:px-4 md:px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center max-w-[820px] mx-auto mb-10 sm:mb-12 md:mb-14">
            <h2 className="text-white text-[28px] sm:text-[38px] md:text-[48px] font-bold leading-tight">
              Our Services & Benefits
            </h2>
            <p className="text-[#b9b9b9] text-sm sm:text-base md:text-[15px] mt-3 leading-6">
              To make renting easy and hassle-free, we provide a variety of services
              and advantages. We have you covered with a variety of vehicles and flexible rental terms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 md:gap-8">
            {benefits.map((item) => (
              <div
                key={item.id}
                className="text-center flex flex-col items-center"
              >
                <div className="w-[58px] h-[58px] sm:w-[64px] sm:h-[64px] rounded-full bg-white flex items-center justify-center text-black shadow-[0_8px_24px_rgba(255,255,255,0.12)] mb-5">
                  {item.icon}
                </div>

                <h3 className="text-white text-[18px] sm:text-[20px] font-semibold mb-3">
                  {item.title}
                </h3>

                <p className="text-[#bdbdbd] text-[13px] sm:text-[14px] leading-6 max-w-[340px]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Info;