"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormFieldArray,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Control, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { SOURCES } from "@/lib/sources/types";
import { ParserOutput } from "@/lib/sources";
import { Course } from "@prisma/client";
import { COURSES } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertCircle,
  ArrowUpRightFromCircle,
  FolderPlus,
  FolderX,
  ListPlus,
  X,
} from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Martian_Mono } from "next/font/google";
import { Label } from "@/components/ui/label";
import { useEffect, useRef } from "react";
import { toast } from "../ui/use-toast";
import { useRouter } from "next/navigation";

const martianMono = Martian_Mono({ subsets: ["latin"], weight: "400" });

const schema = z.object({
  title: z.string().nonempty(),
  time: z.string().nonempty(),
  servings: z.coerce.number().min(1),
  ingredientSets: z
    .array(
      z.object({
        value: z.object({
          name: z.string().optional(),
          ingreds: z
            .array(
              z.object({
                value: z
                  .string()
                  .min(1, "You have an empty ingredient, is that right?"),
              })
            )
            .min(1, "You need at least one ingredient"),
        }),
      })
    )
    .min(1),
  instructionSets: z
    .array(
      z.object({
        value: z.object({
          name: z.string().optional(),
          instructions: z
            .array(
              z.object({
                value: z
                  .string()
                  .min(1, "You have an empty instruction, is that right?"),
              })
            )
            .min(1, "You need at least one instruction"),
        }),
      })
    )
    .min(1),
  imageUrl: z.string().url(),
  notes: z.array(
    z.object({
      value: z.string().min(1, "You have an empty note, is that right?"),
    })
  ),
  postedAt: z.string().datetime().nullish(),
  // keywords: z.string().array(),
  courses: z.array(z.nativeEnum(Course)).min(1),
  sourceUrl: z.string().url(),
  source: z.enum(SOURCES),
});

type Props = {
  parsed: ParserOutput;
};

function initialData(parsed: ParserOutput) {
  if (parsed.status === "success" || parsed.status === "partial") {
    return {
      ...parsed.recipe,
      postedAt: parsed.recipe?.postedAt?.toISOString(),
      ingredientSets: (parsed.recipe?.ingredientSets || []).map((set) => ({
        value: {
          name: set?.name || "",
          ingreds: (set?.ingreds || []).map((i) => ({ value: i })),
        },
      })),
      instructionSets: (parsed.recipe?.instructionSets || []).map((set) => ({
        value: {
          name: set?.name || "",
          instructions: (set?.instructions || []).map((i) => ({ value: i })),
        },
      })),
      notes: parsed.recipe?.notes?.length
        ? (parsed.recipe?.notes || []).map((n) => ({ value: n }))
        : [{ value: "" }],
    };
  }
  return {};
}

export default function RecipeForm({ parsed }: Props) {
  const router = useRouter();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: initialData(parsed),
  });

  const notesFields = useFieldArray({
    name: "notes",
    control: form.control,
  });
  const ingredientSetsFields = useFieldArray({
    name: "ingredientSets",
    control: form.control,
  });
  const instructionSetsFields = useFieldArray({
    name: "instructionSets",
    control: form.control,
  });

  function onSubmit(data: z.infer<typeof schema>) {
    fetch(`/api/recipes`, {
      method: "POST",
      body: JSON.stringify(data),
    }).then(async (res) => {
      const body = await res.json();

      if (!res.ok) {
        return toast({
          variant: "success",
          duration: 1000000,
          title: "Failed to save recipe",
          description: "Check the errors and try again",
        });
      }

      const { id } = z.object({ id: z.coerce.number() }).parse(body);
      toast({
        title: "Recipe saved",
      });
      router.replace(`/recipes/${id}`);
    });
  }

  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    form.trigger();
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <>
      <div ref={topRef} />
      {parsed.status === "error" ? (
        <>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4 mb-6" />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>
              This link could not be parsed as a recipe! This could be a blog
              post, or maybe the recipe is not in a format we support yet.
              <br />
              <br />
              Errors reported:
              <ul className={cn("mt-4 text-xs", martianMono.className)}>
                {parsed.errors.map((error, index) => (
                  <li key={"error-" + index}>{error.message}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>

          <Label className="mt-5 block">Source url</Label>
          <Input className="mt-2" disabled value={parsed.url} />
        </>
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-4"
          >
            <div className="col-span-2 flex gap-3 items-end">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Low fodmap pork belly" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Badge
                className="mb-4"
                variant={
                  parsed.status === "success"
                    ? "success"
                    : parsed.status === "partial"
                    ? "warning"
                    : "destructive"
                }
              >
                {parsed.status}
              </Badge>
            </div>
            {parsed.status === "partial" ? (
              <Alert variant="destructive" className="col-span-2">
                <AlertCircle className="h-4 w-4 mb-6" />
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>
                  This recipe could not be automatically imported! You can still
                  fill out its data manually though.
                  <br />
                  <br />
                  Errors reported:
                  <ul
                    className={cn(
                      "mt-4 text-xs space-y-3",
                      martianMono.className
                    )}
                  >
                    {parsed.errors.map((error, index) => (
                      <li
                        key={"error-" + index}
                        className="flex gap-2 items-center flex-wrap"
                      >
                        <span className="rounded bg-red-100 px-2 py-1 break-words">
                          {error.path}
                        </span>
                        {error.message}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            ) : null}
            <div className="flex gap-4 col-span-2 flex-col lg:flex-row">
              <img
                src={form.getValues("imageUrl")}
                alt={form.getValues("title")}
                className="rounded-md object-cover w-full lg:w-[360px] lg:aspect-auto"
              />
              <div className="flex flex-col gap-2 grow">
                <FormField
                  control={form.control}
                  name="sourceUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source URL</FormLabel>
                      <FormControl>
                        <div className="flex gap-1">
                          <Input
                            disabled
                            placeholder="https://www.example.com/"
                            {...field}
                          />
                          {parsed.recipe.sourceUrl && (
                            <Button
                              asChild
                              variant="outline"
                              title="Open original URL"
                            >
                              <a href={parsed.recipe.sourceUrl} target="_blank">
                                <ArrowUpRightFromCircle className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time</FormLabel>
                  <FormControl>
                    <Input placeholder="2h, 15min..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="servings"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Servings</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="3, 12, 0.5..."
                      type="number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="postedAt"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Posted at</FormLabel>
                  <FormControl>
                    <DatePicker
                      className="w-full"
                      onSelect={field.onChange}
                      value={field.value ? new Date(field.value) : undefined}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select the recipe source" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SOURCES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormFieldArray
              control={form.control}
              name="notes"
              render={() => (
                <>
                  {<FormLabel className="block">Notes</FormLabel>}
                  {notesFields.fields.map((field, index) => (
                    <FormField
                      control={form.control}
                      key={"notes-" + field.id}
                      name={`notes.${index}.value`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <span className="flex items-center gap-1">
                              <Textarea
                                {...field}
                                rows={3}
                                placeholder="Plum sauce: make sure to use a low FODMAP sauce."
                              />
                              <Button
                                variant="link"
                                size="sm"
                                onClick={() => notesFields.remove(index)}
                              >
                                <X size={20} />
                              </Button>
                            </span>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => notesFields.append({ value: "" })}
                  >
                    Add note
                  </Button>
                  <FormMessage />
                </>
              )}
            />
            <FormField
              control={form.control}
              name="courses"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Sidebar</FormLabel>
                  </div>
                  {COURSES.map((item) => (
                    <FormField
                      key={"ff-course-" + item}
                      control={form.control}
                      name="courses"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={"fi-course-" + item}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item)}
                                onCheckedChange={(checked) => {
                                  console.log(":::::: field", field);
                                  return checked
                                    ? field.onChange(
                                        field.value
                                          ? [...field.value, item]
                                          : [item]
                                      )
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== item
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal lowercase">
                              {item}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="col-span-2">
              <h3 className="flex gap-2 items-center text-2xl font-semibold mb-3">
                Ingredient sets
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-1"
                  onClick={() =>
                    ingredientSetsFields.prepend({
                      value: {
                        name: "",
                        ingreds: [{ value: "" }],
                      },
                    })
                  }
                >
                  <FolderPlus />
                </Button>
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {ingredientSetsFields.fields.map((set, index) => (
                  <div
                    className="w-full rounded-lg border bg-card text-card-foreground shadow-sm p-4"
                    key={"set-ingred-" + set.id}
                  >
                    <FormField
                      control={form.control}
                      key={"fi-ingred-" + set.id}
                      name={`ingredientSets.${index}.value.name`}
                      render={({ field }) => (
                        <FormItem className="md:flex-grow mb-6">
                          <div className="flex space-x-2 justify-between items-baseline">
                            <FormLabel>Set Name</FormLabel>
                            <Button
                              type="button"
                              variant="destructiveOutline"
                              size="xs"
                              disabled={
                                ingredientSetsFields.fields.length === 1
                              }
                              onClick={() => ingredientSetsFields.remove(index)}
                            >
                              <FolderX className="mr-2" />
                              Remove set
                            </Button>
                          </div>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <NestedArrayFormField
                      addBtnLabel="Add ingredient"
                      setName="ingredientSets"
                      name="ingreds"
                      // @ts-expect-error inference of nested objects is broken
                      control={form.control}
                      nestIndex={index}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-2">
              <h3 className="flex gap-2 items-center text-2xl font-semibold mb-3">
                Instruction sets
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-1"
                  onClick={() =>
                    instructionSetsFields.prepend({
                      value: {
                        name: "",
                        instructions: [{ value: "" }],
                      },
                    })
                  }
                >
                  <FolderPlus />
                </Button>
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {instructionSetsFields.fields.map((set, index) => (
                  <div
                    className="w-full rounded-lg border bg-card text-card-foreground shadow-sm p-4"
                    key={"set-instructions-" + set.id}
                  >
                    <FormField
                      control={form.control}
                      key={"fi-instructions-" + set.id}
                      name={`instructionSets.${index}.value.name`}
                      render={({ field }) => (
                        <FormItem className="md:flex-grow mb-6">
                          <div className="flex space-x-2 justify-between items-baseline">
                            <FormLabel>Set Name</FormLabel>
                            <Button
                              type="button"
                              variant="destructiveOutline"
                              size="xs"
                              disabled={
                                instructionSetsFields.fields.length === 1
                              }
                              onClick={() =>
                                instructionSetsFields.remove(index)
                              }
                            >
                              <FolderX className="mr-2" />
                              Remove set
                            </Button>
                          </div>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <NestedArrayFormField
                      addBtnLabel="Add instruction"
                      setName="instructionSets"
                      name="instructions"
                      // @ts-expect-error inference of nested objects is broken
                      control={form.control}
                      nestIndex={index}
                    />
                  </div>
                ))}
              </div>
            </div>
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      )}
    </>
  );
}

type NestedArrayFormFieldProps = {
  control: Control<typeof schema>;
  nestIndex: number;
  addBtnLabel: string;
} & (
  | { name: "ingreds"; setName: "ingredientSets" }
  | { name: "instructions"; setName: "instructionSets" }
);
function NestedArrayFormField(props: NestedArrayFormFieldProps) {
  const arrFields = useFieldArray({
    // @ts-expect-error inference of nested objects is broken
    name: `${props.setName}.${props.nestIndex}.value.${props.name}`,
    control: props.control,
  });

  return (
    <div className="md:flex-grow lg:m-0 ml-10 mt-2">
      <FormFieldArray
        control={props.control}
        // @ts-expect-error inference of nested objects is broken
        name={`${props.setName}.${props.nestIndex}.value.${props.name}`}
        render={() => (
          <>
            {arrFields.fields.map((field, index) => (
              <FormField
                control={props.control}
                key={field.id}
                // @ts-expect-error inference of nested objects is broken
                name={`${props.setName}.${props.nestIndex}.value.${props.name}.${index}.value`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={cn(index !== 0 && "sr-only")}>
                      Ingredients
                    </FormLabel>
                    <FormControl>
                      <span className="flex items-center gap-1">
                        <Input {...field} />
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={arrFields.fields.length === 1}
                          onClick={() => arrFields.remove(index)}
                        >
                          <X size={20} />
                        </Button>
                      </span>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => arrFields.append({ value: "" })}
            >
              <ListPlus className="mr-2" />
              {props.addBtnLabel}
            </Button>
            <FormMessage />
          </>
        )}
      />
    </div>
  );
}
