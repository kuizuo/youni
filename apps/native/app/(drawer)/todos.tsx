import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Checkbox,
  Chip,
  Spinner,
  Surface,
  Input,
  TextField,
  useThemeColor,
} from "heroui-native";
import { useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";

import { Container } from "@/components/container";
import { orpc } from "@/utils/orpc";

export default function TodosScreen() {
  const [newTodoText, setNewTodoText] = useState("");
  const todos = useQuery(orpc.todo.getAll.queryOptions());
  const createMutation = useMutation(
    orpc.todo.create.mutationOptions({
      onSuccess: () => {
        todos.refetch();
        setNewTodoText("");
      },
    }),
  );
  const toggleMutation = useMutation(
    orpc.todo.toggle.mutationOptions({
      onSuccess: () => {
        todos.refetch();
      },
    }),
  );
  const deleteMutation = useMutation(
    orpc.todo.delete.mutationOptions({
      onSuccess: () => {
        todos.refetch();
      },
    }),
  );

  const mutedColor = useThemeColor("muted");
  const dangerColor = useThemeColor("danger");
  const foregroundColor = useThemeColor("foreground");

  const handleAddTodo = () => {
    if (newTodoText.trim()) {
      createMutation.mutate({ text: newTodoText });
    }
  };

  const handleToggleTodo = (id: number, completed: boolean) => {
    toggleMutation.mutate({ id, completed: !completed });
  };

  const handleDeleteTodo = (id: number) => {
    Alert.alert("Delete Todo", "Are you sure you want to delete this todo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteMutation.mutate({ id }),
      },
    ]);
  };

  const isLoading = todos?.isLoading;
  const completedCount = todos?.data?.filter((t) => t.completed).length || 0;
  const totalCount = todos?.data?.length || 0;

  return (
    <Container>
      <ScrollView className="flex-1" contentContainerClassName="p-4">
        <View className="py-4 mb-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-semibold text-foreground tracking-tight">Tasks</Text>
            {totalCount > 0 && (
              <Chip variant="secondary" color="accent" size="sm">
                <Chip.Label>
                  {completedCount}/{totalCount}
                </Chip.Label>
              </Chip>
            )}
          </View>
        </View>

        <Surface variant="secondary" className="mb-4 p-3 rounded-lg">
          <View className="flex-row items-center gap-2">
            <View className="flex-1">
              <TextField>
                <Input
                  value={newTodoText}
                  onChangeText={setNewTodoText}
                  placeholder="Add a new task..."
                  editable={!createMutation.isPending}
                  onSubmitEditing={handleAddTodo}
                  returnKeyType="done"
                />
              </TextField>
            </View>
            <Button
              isIconOnly
              variant={createMutation.isPending || !newTodoText.trim() ? "secondary" : "primary"}
              isDisabled={createMutation.isPending || !newTodoText.trim()}
              onPress={handleAddTodo}
              size="sm"
            >
              {createMutation.isPending ? (
                <Spinner size="sm" color="default" />
              ) : (
                <Ionicons
                  name="add"
                  size={20}
                  color={
                    createMutation.isPending || !newTodoText.trim() ? mutedColor : foregroundColor
                  }
                />
              )}
            </Button>
          </View>
        </Surface>

        {isLoading && (
          <View className="items-center justify-center py-12">
            <Spinner size="lg" />
            <Text className="text-muted text-sm mt-3">Loading tasks...</Text>
          </View>
        )}

        {todos?.data && todos.data.length === 0 && !isLoading && (
          <Surface variant="secondary" className="items-center justify-center py-10 rounded-lg">
            <Ionicons name="checkbox-outline" size={40} color={mutedColor} />
            <Text className="text-foreground font-medium mt-3">No tasks yet</Text>
            <Text className="text-muted text-xs mt-1">Add your first task to get started</Text>
          </Surface>
        )}

        {todos?.data && todos.data.length > 0 && (
          <View className="gap-2">
            {todos.data.map((todo) => (
              <Surface key={todo.id} variant="secondary" className="p-3 rounded-lg">
                <View className="flex-row items-center gap-3">
                  <Checkbox
                    isSelected={todo.completed}
                    onSelectedChange={() => handleToggleTodo(todo.id, todo.completed)}
                  />
                  <View className="flex-1">
                    <Text
                      className={`text-sm ${todo.completed ? "text-muted line-through" : "text-foreground"}`}
                    >
                      {todo.text}
                    </Text>
                  </View>
                  <Button
                    isIconOnly
                    variant="ghost"
                    onPress={() => handleDeleteTodo(todo.id)}
                    size="sm"
                  >
                    <Ionicons name="trash-outline" size={16} color={dangerColor} />
                  </Button>
                </View>
              </Surface>
            ))}
          </View>
        )}
      </ScrollView>
    </Container>
  );
}
