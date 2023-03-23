"use client"

import React, { useEffect, useState } from "react"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/context/AuthContext"
import { useGitHubLogout } from "@/firebase/auth/githubLogout"
import { useCreateDocument } from "@/firebase/firestore/createDocument"
import { useDocuments } from "@/firebase/firestore/getDocuments"
import { useGetFavoriteCode } from "@/firebase/firestore/getFavoriteCode"
import { useGetIsPrivateCodeFromUser } from "@/firebase/firestore/getIsPrivateCodeFromUser"
import { useGetIsPrivateCodes } from "@/firebase/firestore/getIsPrivateCodes"
import linearizeCode from "@/utils/linearizeCode"
import { yupResolver } from "@hookform/resolvers/yup"
import {
  Eye,
  EyeOff,
  Loader2,
  MoreHorizontal,
  Plus,
  Star,
  User,
} from "lucide-react"
import moment from "moment"
import { useForm } from "react-hook-form"
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
import * as yup from "yup"

import { cn } from "@/lib/utils"
import CardCode from "@/components/card-code"
import CardCodeAuthor from "@/components/card-code-author"
import Error from "@/components/error"
import { Layout } from "@/components/layout"
import Loader from "@/components/loader"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

export default function Dashboard() {
  const { logout } = useGitHubLogout()

  const { user } = useAuthContext()
  const router = useRouter()
  useEffect(() => {
    if (!user) {
      router.push("/")
    }
  })

  const {
    isLoading: isLoadingPrivateCodes,
    isError: isErrorPrivateCodes,
    data: dataPrivateCodes,
  } = useGetIsPrivateCodeFromUser(true, user.reloadUserInfo.screenName)

  const {
    isLoading: isLoadingPublicCodes,
    isError: isErrorPublicCodes,
    data: dataPublicCodes,
  } = useGetIsPrivateCodeFromUser(false, user.reloadUserInfo.screenName)

  const {
    isLoading: isLoadingFavoriteCodes,
    isError: isErrorFavoriteCodes,
    data: dataFavoriteCodes,
  } = useGetFavoriteCode(user.reloadUserInfo.screenName)

  const [checkboxOn, setCheckboxOn] = useState(false)

  const schema = yup.object().shape({
    code: yup.string().required(),
    description: yup.string().required(),
    language: yup.string().required(),
    tags: yup.string(),
    isPrivate: yup.boolean(),
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  })

  const { createDocument, isLoading, isError, isSuccess }: any =
    useCreateDocument("codes")

  const onSubmit = async (data) => {
    const { code, description, language, tags, isPrivate } = data
    const linearCode = linearizeCode(code)
    const now = moment().valueOf()
    const tabTabs = tags ? tags.split(",") : []
    if (tabTabs[tabTabs.length - 1] === "") {
      tabTabs.pop()
    }

    const newDocument = {
      code: linearCode,
      description: description,
      isPrivate: !!isPrivate,
      language: language,
      tags: tabTabs,
      date: now,
      favoris: [],
      idAuthor: user.reloadUserInfo.screenName,
    }

    createDocument(newDocument)
  }

  return (
    <Layout>
      <Head>
        <title>Sharuco | Dashboard</title>
        <meta
          name="description"
          content="Sharuco allows you to share code snippets that you have found
         useful."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className="container grid items-center gap-6 pt-6 pb-8 md:py-10">
        <div className="flex flex-col items-start gap-2">
          <h1 className="text-2xl font-extrabold leading-tight tracking-tighter sm:text-2xl md:text-4xl lg:text-4xl">
            Dashboard
          </h1>
          <p
            className={cn(
              "text-sm font-medium leading-5 text-gray-500 dark:text-gray-400",
              "sm:text-base md:text-lg lg:text-lg"
            )}
          >
            You can{" "}
            <span className="text-gray-700 dark:text-gray-300">modify</span> or{" "}
            <span className="text-gray-700 dark:text-gray-300">delete</span> a
            code only on the{" "}
            <span className="text-gray-700 dark:text-gray-300">
              public code
            </span>{" "}
            and{" "}
            <span className="text-gray-700 dark:text-gray-300">
              private code
            </span>{" "}
            section.
          </p>
        </div>
        <div className="flex flex-col justify-between gap-2 sm:flex-row">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className={buttonVariants({ size: "lg" })}>
                <Plus className="mr-2 h-4 w-4" />
                Add new snippet
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
                    Add new snippet
                  </h3>
                </AlertDialogTitle>
                <AlertDialogDescription>
                  <div className="mb-4 flex w-full flex-col items-start gap-1.5">
                    <Label htmlFor="code">Insert your code</Label>
                    <Textarea
                      placeholder="Insert your code here..."
                      id="code"
                      {...register("code")}
                    />
                    {errors.code && (
                      <p className="text-sm text-red-500">
                        This field is required
                      </p>
                    )}
                  </div>
                  <div className="mb-4 flex w-full flex-col items-start gap-1.5">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      placeholder="What does this code do ?"
                      id="description"
                      {...register("description")}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500">
                        This field is required
                      </p>
                    )}
                  </div>
                  <div className="mb-4 flex w-full flex-col items-start gap-1.5">
                    <Label htmlFor="language">Language</Label>
                    <Input
                      type="text"
                      id="language"
                      placeholder="The code is written in what language ?"
                      {...register("language")}
                    />
                    {errors.language && (
                      <p className="text-sm text-red-500">
                        This field is required
                      </p>
                    )}
                  </div>
                  <div className="mb-4 flex w-full flex-col items-start gap-1.5">
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      type="text"
                      id="tags"
                      placeholder="Enter a tags ..."
                      {...register("tags")}
                    />
                    <p className="text-sm text-slate-500">
                      Please separate tags with{" "}
                      <span className="text-slate-700 dark:text-slate-300">
                        ,
                      </span>
                    </p>
                    {errors.tags && (
                      <p className="text-sm text-red-500">
                        This field is required
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      {...register("isPrivate")}
                      name="isPrivate"
                      id="isPrivate"
                      className={`h-[24px] w-[24px] cursor-pointer appearance-none rounded-full bg-slate-200 outline-none ring-slate-500
                       ring-offset-0 focus:ring-slate-400 focus:ring-offset-slate-900 dark:bg-slate-800
                      ${checkboxOn ? "ring-2" : "ring-0"}
                      `}
                      checked={checkboxOn}
                      onChange={() => setCheckboxOn(!checkboxOn)}
                    />
                    <Label htmlFor="isPrivate">
                      Will this code be private ?{" "}
                      {checkboxOn ? (
                        <span className="font-bold text-teal-300">Yes</span>
                      ) : (
                        <span className="font-bold text-teal-300">No</span>
                      )}
                    </Label>
                  </div>
                  {isSuccess && (
                    <p className="pt-4 text-sm font-bold text-green-500">
                      Your code has been added successfully !
                    </p>
                  )}
                  {isError && (
                    <p className="pt-4 text-sm font-bold text-red-500">
                      An error has occurred, please try again later.
                    </p>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <button
                  className={cn(
                    "inline-flex h-10 items-center justify-center rounded-md bg-slate-900 py-2 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 dark:focus:ring-slate-400 dark:focus:ring-offset-slate-900"
                  )}
                  disabled={isLoading}
                  onClick={!isLoading ? handleSubmit(onSubmit) : undefined}
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Submit
                </button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Link
            href={`/${user.reloadUserInfo.screenName}`}
            className={buttonVariants({ size: "lg", variant: "outline" })}
          >
            <User className="mr-2 h-4 w-4" />
            Your profile
          </Link>
        </div>
        <Tabs defaultValue="public-code" className="w-full">
          <TabsList>
            <div>
              <TabsTrigger value="public-code">
                <Eye className="mr-2 h-4 w-4" />
                public code
              </TabsTrigger>
              <TabsTrigger value="private-code">
                <EyeOff className="mr-2 h-4 w-4" />
                Private code
              </TabsTrigger>
              <TabsTrigger value="favorite-code">
                <Star className="mr-2 h-4 w-4" />
                Favorite code
              </TabsTrigger>
            </div>
          </TabsList>
          <TabsContent className="border-none p-0 pt-4" value="public-code">
            {isLoadingPublicCodes && <Loader />}
            {dataPublicCodes && (
              <>
                <ResponsiveMasonry
                  columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}
                  className="w-full"
                >
                  <Masonry gutter="1rem">
                    {dataPublicCodes
                      .sort((a, b) => {
                        return moment(b.createdAt).diff(moment(a.createdAt))
                      })
                      .map(
                        (code: {
                          id: string
                          idAuthor: string
                          language: string
                          code: string
                          description: string
                          tags: string[]
                          favoris: string[]
                        }) => (
                          <CardCodeAuthor
                            key={code.id}
                            id={code.id}
                            idAuthor={code.idAuthor}
                            language={code.language}
                            code={code.code}
                            description={code.description}
                            tags={code.tags}
                            favoris={code.favoris}
                          />
                        )
                      )}
                  </Masonry>
                </ResponsiveMasonry>
                {dataPublicCodes.length == 0 && (
                  <div className="flex flex-col items-center gap-4">
                    <h1 className="text-2xl font-bold">
                      You don&apos;t have any public code yet
                    </h1>
                  </div>
                )}
              </>
            )}
            {isErrorPublicCodes && <Error />}
          </TabsContent>
          <TabsContent className="border-none p-0 pt-4" value="private-code">
            {isLoadingPrivateCodes && <Loader />}
            {dataPrivateCodes && (
              <>
                <ResponsiveMasonry
                  columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}
                  className="w-full"
                >
                  <Masonry gutter="1rem">
                    {dataPrivateCodes
                      .sort((a, b) => {
                        return moment(b.createdAt).diff(moment(a.createdAt))
                      })
                      .map(
                        (code: {
                          id: string
                          idAuthor: string
                          language: string
                          code: string
                          description: string
                          tags: string[]
                          favoris: string[]
                        }) => (
                          <CardCodeAuthor
                            key={code.id}
                            id={code.id}
                            idAuthor={code.idAuthor}
                            language={code.language}
                            code={code.code}
                            description={code.description}
                            tags={code.tags}
                            favoris={code.favoris}
                          />
                        )
                      )}
                  </Masonry>
                </ResponsiveMasonry>
                {dataPrivateCodes.length == 0 && (
                  <div className="flex flex-col items-center gap-4">
                    <h1 className="text-2xl font-bold">
                      You don&apos;t have any private code yet
                    </h1>
                  </div>
                )}
              </>
            )}
            {isErrorFavoriteCodes && <Error />}
          </TabsContent>
          <TabsContent className="border-none p-0 pt-4" value="favorite-code">
            {isLoadingFavoriteCodes && <Loader />}
            {dataFavoriteCodes && (
              <>
                <ResponsiveMasonry
                  columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}
                  className="w-full"
                >
                  <Masonry gutter="1rem">
                    {dataFavoriteCodes
                      .sort((a, b) => {
                        return moment(b.createdAt).diff(moment(a.createdAt))
                      })
                      .map(
                        (code: {
                          id: string
                          idAuthor: string
                          language: string
                          code: string
                          description: string
                          tags: string[]
                          favoris: string[]
                        }) => (
                          <CardCode
                            key={code.id}
                            id={code.id}
                            idAuthor={code.idAuthor}
                            language={code.language}
                            code={code.code}
                            description={code.description}
                            tags={code.tags}
                            favoris={code.favoris}
                          />
                        )
                      )}
                  </Masonry>
                </ResponsiveMasonry>
                {dataFavoriteCodes.length == 0 && (
                  <div className="flex flex-col items-center gap-4">
                    <h1 className="text-2xl font-bold">
                      You don&apos;t have any favorite code yet
                    </h1>
                    <Link
                      href="/explore"
                      className={buttonVariants({
                        size: "lg",
                        variant: "outline",
                      })}
                    >
                      Explore code
                    </Link>
                  </div>
                )}
              </>
            )}
            {isErrorFavoriteCodes && <Error />}
          </TabsContent>
        </Tabs>
      </section>
    </Layout>
  )
}
