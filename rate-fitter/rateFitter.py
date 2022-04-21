import numpy as np
from scipy.optimize import curve_fit
import json
import math

with open('resources/global.json', 'r') as file:
  data = json.load(file)


def constrain(value, minValue, maxValue):
    if isinstance(value, int) | isinstance(value, float):
        return max(minValue, min(value, maxValue))
    return [max(minValue, min(x, maxValue)) for x in value]

def getBetaflightRates(rcCommandf, rcCommandfAbs, rate, rcRate, rcExpo, superExpoActive, limit):
    if rcRate > 2:
        rcRate = rcRate + (rcRate - 2) * 14.54

    expoPower = 2
    rcRateConstant = 205.85

    if rcExpo > 0:
        rcCommandf =  rcCommandf * (rcCommandfAbs**expoPower) * rcExpo + rcCommandf * (1-rcExpo)

    if superExpoActive:
        rcFactor = 1 / constrain(1 - rcCommandfAbs * rate, 0.01, 1)
        angularVel = rcRateConstant * rcRate * rcCommandf # 200 should be variable checked on version (older versions it's 205,9)
        angularVel = angularVel * rcFactor
    else:
        angularVel = (((rate * 100) + 27) * rcCommandf / 16) / 4.1 # Only applies to old versions ?

    angularVel = constrain(angularVel, -1 * limit, limit) # Rate limit from profile

    return angularVel

def getRaceflightRates(rcCommandf, rate, rcRate, rcExpo):
    angularVel = ((1 + 0.01 * rcExpo * (rcCommandf * rcCommandf - 1.0)) * rcCommandf)
    angularVel = (angularVel * (rcRate + (abs(angularVel) * rcRate * rate * 0.01)))
    return angularVel

def getKISSRates(rcCommandf, rcCommandfAbs, rate, rcRate, rcExpo):
    kissRpy = 1 - rcCommandfAbs * rate
    kissTempCurve = rcCommandf * rcCommandf
    rcCommandf = ((rcCommandf * kissTempCurve) * rcExpo + rcCommandf * (1 - rcExpo)) * (rcRate / 10)
    return ((2000.0 * (1.0 / kissRpy)) * rcCommandf)

def getActualRates(rcCommandf, rcCommandfAbs, rate, rcRate, rcExpo):
    expof = rcCommandfAbs * (((rcCommandf ** 5) * rcExpo) + (rcCommandf * (1 - rcExpo)))
    angularVel = max(0, rate-rcRate)
    angularVel = (rcCommandf * rcRate) + (angularVel * expof)
    return angularVel

def getQuickRates(rcCommandf, rcCommandfAbs, rate, rcRate, rcExpo):
    rcRate = rcRate * 200
    rate = max(rate, rcRate)
    superExpoConfig = (((rate / rcRate) - 1) / (rate / rcRate))
    curve = (rcCommandfAbs ** 3) * rcExpo + rcCommandfAbs * (1 - rcExpo)
    angularVel = 1.0 / (1.0 - (curve * superExpoConfig))
    angularVel = rcCommandf * rcRate * angularVel
    return angularVel

# print(getBetaflightRates(.6, .6, .7, 1, .5, True, 2000))
# print(getRaceflightRates(.6, 80, 370, 50))
# print(getKISSRates(.6, .6, .7, 1, 0))
# print(getActualRates(.6, .6, 670, 200, .54))
# print(getQuickRates(.6, .6, 670, 1, 0))









# import json

# with open('resources/global.json', 'r') as file:
#   data = json.load(file)

# get degrees per second value at any given rc command
def getDegreeesPerSecondAtRcCommand(rateType, rcCommandf, rate, rcRate, rcExpo):

    rcCommandfAbs = abs(rcCommandf)

    if rateType == "betaflight":
        # print("generating betaflight")
        anglerate = getBetaflightRates(rcCommandf, rcCommandfAbs, rate, rcRate, rcExpo, True, 2000)
    elif rateType == "raceflight":
        # print("generating raceflight")
        anglerate = getRaceflightRates(rcCommandf, rate, rcRate, rcExpo)
    elif rateType == "kiss":
        # print("generating kiss")
        anglerate = getKISSRates(rcCommandf, rcCommandfAbs, rate, rcRate, rcExpo)
    elif rateType == "actual":
        # print("generating actual")
        anglerate = getActualRates(rcCommandf, rcCommandfAbs, rate, rcRate, rcExpo)
    elif rateType == "quickrates":
        # print("generating quickrates")
        anglerate = getQuickRates(rcCommandf, rcCommandfAbs, rate, rcRate, rcExpo)
    else:
        return 0

    return anglerate

def generateCurve(rateType, rate, rcRate, rcExpo):
    
    # run 10 datapoints between 0 and 1 - it seems like any more than this exceeds the limits
    rcValues = [(x*10)/100 for x in range(0, 11)]

    # run all 500 points between 0 and 1
    # rcValues = [(x*2)/1000 for x in range(0, 501)]
    # run 50 points between 0 and 1
    # rcValues = [(x*20)/1000 for x in range(0, 51)]
    # run 25 points between 0 and 1
    # rcValues = [(x*40)/1000 for x in range(0, 26)]

    curveValues = []

    for rcCommand in rcValues:
        curveValues.append(getDegreeesPerSecondAtRcCommand(rateType, rcCommand, rate, rcRate, rcExpo))

    return curveValues

def testCurveFunctions():
    rateType_v = "betaflight"
    rate_v = data[rateType_v]["rateValues"]["rate"]["default"]
    rcRate_v = data[rateType_v]["rateValues"]["rc_rate"]["default"]
    rcExpo_v = data[rateType_v]["rateValues"]["rc_expo"]["default"]
    rcCommand_v = .2

    newRCValue = getDegreeesPerSecondAtRcCommand(rateType_v, 1, rate_v, rcRate_v, rcExpo_v)
    # newCurve = generateCurve(rateType_v, rate_v, rcRate_v, rcExpo_v)

    print(newRCValue)
    # print(newCurve)

# testCurveFunctions()









# # FULLY FUNCTIONAL

# import matplotlib.pyplot as plt
# import numpy as np
# from scipy.optimize import curve_fit

# srcRateType = "betaflight"
# tgtRateType = "quickrates"

# srcRcRate = data[srcRateType]["rateValues"]["rc_rate"]["default"]
# srcRate = data[srcRateType]["rateValues"]["rate"]["default"]
# srcExpo = data[srcRateType]["rateValues"]["rc_expo"]["default"]

# y = np.array(generateCurve(srcRateType,srcRate,srcRcRate,srcExpo))

# def func(x, a, b, c):
#     if isinstance(x, int | float):
#         return getDegreeesPerSecondAtRcCommand(tgtRateType, x/10, a, b, c)
#     return [getDegreeesPerSecondAtRcCommand(tgtRateType, z/10, a, b, c) for z in x]

# # working range 0-10 - seems like any more than this exceeds limits
# x = np.array([x for x in range(0, 11)])

# # tgtRateMin,tgtRcRateMin,tgtRcExpoMin = lower bounds
# # tgtRateMax,tgtRcRateMax,tgtRcExpoMax = upper bounds
# tgtRateMin = data[tgtRateType]["rateValues"]["rate"]["min"]
# tgtRcRateMin = data[tgtRateType]["rateValues"]["rc_rate"]["min"]
# tgtRcExpoMin = data[tgtRateType]["rateValues"]["rc_expo"]["min"]

# tgtRateMax = data[tgtRateType]["rateValues"]["rate"]["max"]
# tgtRcRateMax = data[tgtRateType]["rateValues"]["rc_rate"]["max"]
# tgtRcExpoMax = data[tgtRateType]["rateValues"]["rc_expo"]["max"]

# initialGuess = [
#     data[tgtRateType]["rateValues"]["rate"]["default"]/2,
#     data[tgtRateType]["rateValues"]["rc_rate"]["default"]/2,
#     data[tgtRateType]["rateValues"]["rc_expo"]["default"]/2
# ]

# popt, pcov = curve_fit(func, x, y, p0=[*initialGuess], bounds=([tgtRateMin,tgtRcRateMin,tgtRcExpoMin],[tgtRateMax,tgtRcRateMax,tgtRcExpoMax]))

# plt.plot(x, y, 'b-', label='data')
# plt.plot(x, func(x, *popt), 'r-', label='fit')

# print(round(popt[1],2),round(popt[0],2),round(popt[2],2))

# plt.xlabel('x')
# plt.ylabel('y')
# plt.legend()
# plt.show()




def validateData(srcRateType, tgtRateType, srcRate, srcRcRate, srcRcExpo):

    try:
        srcRateMin = float(data[srcRateType]["rateValues"]["rate"]["min"])
        srcRcRateMin = float(data[srcRateType]["rateValues"]["rc_rate"]["min"])
        srcRcExpoMin = float(data[srcRateType]["rateValues"]["rc_expo"]["min"])

        srcRateMax = float(data[srcRateType]["rateValues"]["rate"]["max"])
        srcRcRateMax = float(data[srcRateType]["rateValues"]["rc_rate"]["max"])
        srcRcExpoMax = float(data[srcRateType]["rateValues"]["rc_expo"]["max"])
    except:
        raise ValueError("invalid srcRateType: ", srcRateType)

    if tgtRateType not in data.keys():
        raise ValueError("invalid tgtRateType: ", tgtRateType)
    elif srcRate < srcRateMin or srcRate > srcRateMax:
        raise ValueError("srcRate value out of range: ", srcRate)
    elif srcRcRate < srcRcRateMin or srcRcRate > srcRcRateMax:
        raise ValueError("srcRcRate value out of range: ", srcRcRate)
    elif srcRcExpo < srcRcExpoMin or srcRcExpo > srcRcExpoMax:
        raise ValueError("srcRcExpo value out of range: ", srcRcExpo)



# import numpy as np
# from scipy.optimize import curve_fit

def getFitValues(srcRateType, tgtRateType, srcRate, srcRcRate, srcRcExpo):

    validateData(srcRateType, tgtRateType, srcRate, srcRcRate, srcRcExpo)

    y = np.array(generateCurve(srcRateType,srcRate,srcRcRate,srcRcExpo))

    x = np.array([x for x in range(0, 11)])
    
    def fitFunction(x, a, b, c):
        if isinstance(x, int) | isinstance(x, float):
            return getDegreeesPerSecondAtRcCommand(tgtRateType, x/10, a, b, c)
        return [getDegreeesPerSecondAtRcCommand(tgtRateType, z/10, a, b, c) for z in x]

    # tgtRateMin,tgtRcRateMin,tgtRcExpoMin = lower bounds
    # tgtRateMax,tgtRcRateMax,tgtRcExpoMax = upper bounds
    tgtRateMin = data[tgtRateType]["rateValues"]["rate"]["min"]
    tgtRcRateMin = data[tgtRateType]["rateValues"]["rc_rate"]["min"]
    tgtRcExpoMin = data[tgtRateType]["rateValues"]["rc_expo"]["min"]

    tgtRateMax = data[tgtRateType]["rateValues"]["rate"]["max"]
    tgtRcRateMax = data[tgtRateType]["rateValues"]["rc_rate"]["max"]
    tgtRcExpoMax = data[tgtRateType]["rateValues"]["rc_expo"]["max"]

    initialGuess = [
        data[tgtRateType]["rateValues"]["rate"]["default"]/2,
        data[tgtRateType]["rateValues"]["rc_rate"]["default"]/2,
        data[tgtRateType]["rateValues"]["rc_expo"]["default"]/2
    ]

    popt, pcov = curve_fit(fitFunction, x, y, p0=[*initialGuess], bounds=([tgtRateMin,tgtRcRateMin,tgtRcExpoMin],[tgtRateMax,tgtRcRateMax,tgtRcExpoMax]))


    if tgtRateType == "raceflight":
        rate = int(math.ceil((popt[0])))
        rc_rate = int(math.ceil((popt[1])))
        rc_expo = int(math.ceil((popt[2])))
    elif tgtRateType == "actual":
        rate = int(math.ceil((popt[0])))
        rc_rate = int(math.ceil((popt[1])))
        rc_expo = round(popt[2],2)
    elif tgtRateType == "quickrates":
        rate = int(math.ceil((popt[0])))
        rc_rate = round(popt[1],2)
        rc_expo = round(popt[2],2)
    else:
        rate = round(popt[0],2)
        rc_rate = round(popt[1],2)
        rc_expo = round(popt[2],2)

    fitValues = {
        "srcRateType": srcRateType, 
        "src_rate": srcRate,
        "src_rc_rate": srcRcRate,
        "src_rc_expo": srcRcExpo,
        "tgtRateType": tgtRateType,
        "tgt_rate": rate,
        "tgt_rc_rate": rc_rate,
        "tgt_rc_expo": rc_expo
    }

    return fitValues

    print(fitValues["rc_rate"],fitValues["rate"],fitValues["rc_expo"])

# getFitValues(srcRateType, tgtRateType, srcRate, srcRcRate, srcRcExpo)
# print(getFitValues("betaflight", "raceflight", .7, 1, .5))
