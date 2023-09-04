import React from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { TextField, Button, IconButton } from '@radix-ui/themes';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { motion } from "framer-motion";
import { MixerHorizontalIcon, CopyIcon, CheckIcon, TimerIcon } from '@radix-ui/react-icons';
import { atomWithStorage } from 'jotai/utils'
import copy from 'copy-to-clipboard';
import qs from 'query-string';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const url = new URL(typeof window !== 'undefined' ? window.location.href : 'https://a.com');
const urlQuery = url.searchParams;

const promptAtom = atom('');
const imageAtom = atom('');
const loadingAtom = atom(false);
const startLoadingAtom = atom(false);
const reloadingAtom = atom(false);
const freshAtom = atom(true);
const enabledSettingsAtom = atomWithStorage('enabledSettings', false);
const negativePromptAtom = atomWithStorage('negativePrompt', '');
const stepAtom = atomWithStorage('step', 20);
const seedAtom = atomWithStorage('seed', -1);
const cfgAtom = atomWithStorage('cfg', 7);
const copiedAtom = atom(false);
const timeAtom = atom('');

const payloadAtom = atom(get => ({
  prompt: get(promptAtom),
  negative_prompt: get(negativePromptAtom),
  step: Number(get(stepAtom) || ''),
  seed: Number(get(seedAtom) || ''),
  cfg: get(cfgAtom),
}));

const fadeInConfig = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
}

export default function Home() {
  const [prompt, setPrompt] = useAtom(promptAtom);
  const [image, setImage] = useAtom(imageAtom);
  const [loading, setLoading] = useAtom(loadingAtom);
  const [startLoading, setStartLoading] = useAtom(startLoadingAtom);
  const [reloading, setReloading] = useAtom(reloadingAtom);
  const [fresh, setFresh] = useAtom(freshAtom);
  const [enabledSettings, setEnabledSettings] = useAtom(enabledSettingsAtom);
  const payload = useAtomValue(payloadAtom);
  const setTime = useSetAtom(timeAtom);

  React.useEffect(() => {
    if (urlQuery.get('prompt')) {
      setPrompt(urlQuery.get('prompt'));
    }
  }, []);

  const submit = async (e) => {
    if (!prompt) {
      return;
    }
    setFresh(false);
    if (image) {
      setReloading(true);
      setImage('');
      await sleep(100);
      setReloading(false);
    }
    setStartLoading(false);
    setLoading(true);
    await sleep(100);
    setStartLoading(true);

    const now = Date.now();
    const timer = setInterval(() => {
      setTime(((Date.now() - now)/ 1000).toFixed(1))
    }, 100);

    try {
      const response = await fetch("/api/text2img", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      await sleep(2000);
      const res = await response.json();
      setImage(res.imageFileName);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }

    clearInterval(timer);
  };

  return (
    <div className="container max-w-2xl mx-auto p-5">
      <Head>
        <title>Text to Image</title>
      </Head>

      <div className={`${fresh ? 'h-[40px]' : enabledSettings ? 'h-0' : 'h-4'} transition-all duration-400`} />

      {fresh && (
        <motion.div
          {...fadeInConfig}
          transition={{
            duration: 0.8,
          }}>
          <h1 className="text-center font-bold text-[52px] flex items-center justify-center leading-none tracking-wide pb-4">
            Text
            <motion.div
              animate={{ transform: ['translateX(-10px)', 'translateX(10px)', 'translateX(0)'] }}
              ease="linear"
              transition={{
                duration: 1.5,
                delay: 0.2,
              }}>
              <div className="px-8 mt-3 transform opacity-80">
                👉
              </div>
            </motion.div>
            Image
          </h1>
        </motion.div>
      )}

      {!fresh && !loading && !image && (
        <motion.div
          {...fadeInConfig}
        transition={{
            duration: 0.8,
          }}>
          <p className="text-center mt-1 text-md pt-10 text-red-400">
            Somethings wrong. Try again.
          </p>
        </motion.div>
      )}

      {(loading || image) && !reloading && (
        <div className={`flex items-center justify-center delay-100 duration-1000 transition-all ease-in-out relative mx-auto w-[380px] ${startLoading ? 'h-[380px]' : 'h-0'} rounded-3xl bg-slate-700 ${enabledSettings ? 'mt-2' : 'mt-4'} mb-2 ${loading ? 'animate-pulse' : ''}`}>
          <span className={`text-[20px] transition-all delay-1000 duration-1000 ${startLoading ? 'opacity-50' : 'opacity-0'}`}>One moment...</span>
          {image && (
            <Image
              className="rounded-3xl"
              fill
              src={`/api/images/${image}`}
              alt="output"
              sizes="380px"
            />
          )}
        </div>
      )}

      {!loading && !reloading && (
        <motion.div
          {...fadeInConfig}
          transition={{
            duration: 0.8,
            delay: 0.8,
          }}>
          <div className="w-full flex items-center justify-center mt-8 transition-all duration-1000">
            <div className="w-[320px] mr-2">
              <TextField.Input size="3" placeholder="Prompt" value={prompt}
                onChange={(e) => { setPrompt(e.target.value) }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    submit();
                  }
                }}
              />
            </div>
            <Button className={prompt ? '' : 'cursor-not-allowed'} size="3" onClick={submit}>Generate</Button>
            <div className="ml-2 fixed top-10 right-10" onClick={() => {
              setEnabledSettings(!enabledSettings);
            }}>
              <IconButton size="3" variant="soft">
                <span className="opacity-80">
                  <MixerHorizontalIcon width="18" height="18" />
                </span>
              </IconButton>
            </div>
          </div>
          {<Settings />}
          {image && <Share />}

          {(fresh || !enabledSettings) && (
            <div className="h-6" />
          )}
    
          <motion.div
            {...fadeInConfig}
            transition={{
              duration: 0.8,
              delay: 0.8
            }}>
            <div className="flex justify-center pt-4 text-sm leading-loose">
              <span className="opacity-60 tracking-wider">Powered by</span>
              <Link
                className="font-bold ml-2 transition opacity-70 tracking-wider underline underline-offset-4"
                href="https://kalos.art"
                target="_blank"
              >
                Kalos-ai
              </Link>
            </div>
          </motion.div>

        </motion.div>
      )}

      <Timer />
    </div>
  );
}


function Settings() {
  const [enabledSettings, setEnabledSettings] = useAtom(enabledSettingsAtom);
  const [negativePrompt, setNegativePrompt] = useAtom(negativePromptAtom);
  const [step, setStep] = useAtom(stepAtom);
  const [seed, setSeed] = useAtom(seedAtom);
  const [cfg, setCfg] = useAtom(cfgAtom);

  React.useEffect(() => {
    let effected = false;
    if (urlQuery.get('negativePrompt')) {
      setNegativePrompt(urlQuery.get('negativePrompt'));
      effected = true;
    }
    if (urlQuery.get('step')) {
      setStep(urlQuery.get('step'));
      effected = true;
    }
    if (urlQuery.get('seed')) {
      setSeed(urlQuery.get('seed'));
      effected = true;
    }
    if (urlQuery.get('cfg')) {
      setCfg(urlQuery.get('cfg'));
      effected = true;
    }
    if (effected) {
      setEnabledSettings(true);
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          window.history.replaceState({ path : window.location.origin }, '', window.location.origin);
        }, 1000);
      }
    }
  }, []);

  if (!enabledSettings) {
    return null;
  }

  return (
    <motion.div
      {...fadeInConfig}
      transition={{
        duration: 0.5,
      }}>
      <div className="mx-auto w-[430px] mt-5">
        <div>
          <div className="pb-[6px] ml-[2px] text-[14px] text-white/60 tracking-wider">Negative Prompt</div>
          <TextField.Input size="3" value={negativePrompt} onChange={(e) => { setNegativePrompt(e.target.value) }} />
        </div>
        <div className="grid grid-cols-3 gap-x-3 gap-y-4 mt-3">
          <div>
            <div className="pb-[6px] ml-[2px] text-[14px] text-white/60 tracking-wider">Step</div>
            <TextField.Input size="3" value={step} onChange={(e) => { setStep(e.target.value) }} />
          </div>
          <div>
            <div className="pb-[6px] ml-[2px] text-[14px] text-white/60 tracking-wider">Seed</div>
            <TextField.Input size="3" value={seed} onChange={(e) => { setSeed(e.target.value) }} />
          </div>
          <div>
            <div className="pb-[6px] ml-[2px] text-[14px] text-white/60 tracking-wider">CFG</div>
            <TextField.Input size="3" value={cfg} onChange={(e) => { setCfg(e.target.value) }} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function Share() {
  const payload = useAtomValue(payloadAtom);
  const [copied, setCopied] = useAtom(copiedAtom);

  return (
    <div className="ml-2 fixed bottom-10 right-10" onClick={async () => {
      copy(`${url.origin}?${qs.stringify(payload, { skipEmptyString: true })}`)
      setCopied(true);
      await sleep(500);
      setCopied(false);
    }}>
      <Button size="3" variant="soft">
        {copied ? <CheckIcon width="16" height="16" /> : <CopyIcon width="16" height="16" />} Share Prompt
      </Button>
    </div>
  )
}

function Timer() {
  const time = useAtomValue(timeAtom);

  if (!time) {
    return null;
  }

  return (
    <motion.div
      {...fadeInConfig}
      transition={{
        duration: 0.8,
        delay: 0.8
      }}>
      <div className="fixed top-10 left-10">
        <Button size="3" variant="soft">
          <span className="opacity-80">
            <TimerIcon width="18" height="18" />
          </span>
          <span className="opacity-80">{time}1 s</span>
        </Button>
      </div>
    </motion.div>
  )
}